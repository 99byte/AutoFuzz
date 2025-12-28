import { prisma } from './prisma';
import { AutoGLMFuzzer } from './autoglm';
import { HDCMonitor } from './hdc';
import { TestCaseGenerator } from './ai';
import { ScreenshotManager } from './screenshot';
import { GeneratedTestCase, FuzzActionDetail } from '@/types/ai';
import { streamToClient } from './stream';

interface FuzzTaskConfig {
  taskId: string;
  targetApp: string;
  appDescription: string;
  testDepth: number;
  focusAreas: string[];
}

export class FuzzTaskRunner {
  private config: FuzzTaskConfig;
  private fuzzer: AutoGLMFuzzer;
  private hdcMonitor: HDCMonitor;
  private testGenerator: TestCaseGenerator;
  private screenshotManager: ScreenshotManager;
  private isRunning: boolean = false;

  constructor(config: FuzzTaskConfig) {
    this.config = config;

    this.fuzzer = new AutoGLMFuzzer({
      apiKey: process.env.ZHIPU_API_KEY!,
      baseUrl: process.env.AUTOGLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
      model: process.env.AUTOGLM_MODEL || 'autoglm-phone'
    });

    this.hdcMonitor = new HDCMonitor(config.targetApp);

    this.testGenerator = new TestCaseGenerator(
      process.env.ZHIPU_API_KEY!,
      process.env.GLM_MODEL || 'glm-4'
    );

    this.screenshotManager = new ScreenshotManager(config.taskId);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      console.warn('任务已在运行中');
      return;
    }

    this.isRunning = true;

    try {
      await this.screenshotManager.init();
      await this.updateTaskStatus('running');
      streamToClient(this.config.taskId, { type: 'task_started' });

      streamToClient(this.config.taskId, { type: 'generating_test_cases' });
      const testCases = await this.testGenerator.generateUITestCases({
        targetApp: this.config.targetApp,
        appDescription: this.config.appDescription,
        testDepth: this.config.testDepth,
        focusAreas: this.config.focusAreas
      });

      await prisma.fuzzTask.update({
        where: { id: this.config.taskId },
        data: { testCases: JSON.stringify(testCases) }
      });

      streamToClient(this.config.taskId, {
        type: 'test_cases_generated',
        count: testCases.length
      });

      let crashCount = 0;
      let currentTestCaseIndex = 0;
      let currentActionIndex = 0;

      this.hdcMonitor.startMonitoring(async (crash) => {
        console.log('检测到崩溃:', crash);
        crashCount++;

        const crashScreenshotUrl = await this.screenshotManager.captureActionScreenshot(
          currentTestCaseIndex,
          currentActionIndex
        );

        streamToClient(this.config.taskId, {
          type: 'crash_with_state',
          testCaseIndex: currentTestCaseIndex,
          actionIndex: currentActionIndex,
          screenshotUrl: crashScreenshotUrl,
          timestamp: Date.now(),
          crash: crash
        });

        streamToClient(this.config.taskId, {
          type: 'crash_detected',
          crash: crash,
          totalCrashes: crashCount
        });
      });

      let passedCount = 0;
      let failedCount = 0;
      let timeoutCount = 0;

      for (let i = 0; i < testCases.length && this.isRunning; i++) {
        const testCase = testCases[i];

        const execution = await prisma.testExecution.create({
          data: {
            taskId: this.config.taskId,
            testCaseIndex: i,
            status: 'running'
          }
        });

        streamToClient(this.config.taskId, {
          type: 'test_case_started',
          index: i + 1,
          total: testCases.length,
          description: testCase.description
        });

        const startTime = Date.now();
        const caseSuccessCount: number[] = [];
        const caseFailedCount: number[] = [];
        const caseCrashCount: number[] = [];

        try {
          await this.hdcMonitor.forceStopApp();
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.hdcMonitor.launchApp();

          const startScreenshotUrl = await this.screenshotManager.captureStartScreenshot(i);
          streamToClient(this.config.taskId, {
            type: 'action_completed_with_state',
            testCaseIndex: i,
            actionIndex: -1,
            action: {
              type: 'Launch',
              description: '启动应用',
              params: {}
            },
            screenshotUrl: startScreenshotUrl,
            timestamp: Date.now(),
            duration: 3000,
            success: true,
            status: 'completed'
          });

          const actions: any[] = testCase.actions.map((action: FuzzActionDetail) => ({
            action: action.action,
            description: action.description,
            params: action.params
          }));

          for (let j = 0; j < actions.length && this.isRunning; j++) {
            currentActionIndex = j;
            currentTestCaseIndex = i;

            const result = await this.fuzzer.executeAction({
              action: actions[j].action,
              description: actions[j].description,
              params: actions[j].params
            }, this.config.targetApp);

            const screenshotUrl = await this.screenshotManager.captureActionScreenshot(
              i,
              j
            );

            const status: 'completed' | 'failed' | 'crashed' = result.success ? 'completed' : 'failed';

            streamToClient(this.config.taskId, {
              type: 'action_completed_with_state',
              testCaseIndex: i,
              actionIndex: j,
              action: {
                type: actions[j].action,
                description: actions[j].description,
                params: actions[j].params
              },
              screenshotUrl: screenshotUrl,
              timestamp: Date.now(),
              duration: result.timestamp || 0,
              success: result.success,
              status: status
            });

            if (result.success) {
              caseSuccessCount.push(j);
            } else {
              caseFailedCount.push(j);
            }
          }

          const finalScreenshotUrl = await this.screenshotManager.captureFinalScreenshot(i);

          const duration = Date.now() - startTime;
          const allSuccess = caseFailedCount.length === 0;

          await prisma.testExecution.update({
            where: { id: execution.id },
            data: {
              status: allSuccess ? 'completed' : 'failed',
              endTime: new Date(),
              duration: duration,
              logs: JSON.stringify({ success: caseSuccessCount, failed: caseFailedCount }, null, 2)
            }
          });

          streamToClient(this.config.taskId, {
            type: 'test_case_completed',
            testCaseIndex: i,
            totalActions: actions.length,
            successCount: caseSuccessCount.length,
            failedCount: caseFailedCount.length,
            crashCount: caseCrashCount.length,
            totalDuration: duration,
            finalScreenshotUrl: finalScreenshotUrl
          });

          if (allSuccess) {
            passedCount++;
          } else {
            failedCount++;
          }

        } catch (error) {
          console.error(`测试用例 ${i + 1} 执行失败:`, error);
          failedCount++;

          await prisma.testExecution.update({
            where: { id: execution.id },
            data: {
              status: 'failed',
              endTime: new Date(),
              duration: Date.now() - startTime,
              logs: (error as Error).message
            }
          });
        }
      }

      this.hdcMonitor.stopMonitoring();

      await prisma.testResult.create({
        data: {
          taskId: this.config.taskId,
          totalCases: testCases.length,
          passedCases: passedCount,
          failedCases: failedCount,
          crashCount: crashCount,
          timeoutCount: timeoutCount,
          executionTime: Math.floor((Date.now() - new Date().getTime()) / 1000)
        }
      });

      await this.updateTaskStatus('completed');
      streamToClient(this.config.taskId, {
        type: 'task_completed',
        summary: {
          total: testCases.length,
          passed: passedCount,
          failed: failedCount,
          crashes: crashCount
        }
      });

    } catch (error) {
      console.error('Fuzz测试执行失败:', error);
      await this.updateTaskStatus('failed');
      streamToClient(this.config.taskId, {
        type: 'task_failed',
        error: (error as Error).message
      });
    } finally {
      this.isRunning = false;
    }
  }

  stop(): void {
    this.isRunning = false;
    this.adbMonitor.stopMonitoring();
  }

  private async updateTaskStatus(status: string): Promise<void> {
    const now = new Date();
    const updateData: any = { status };

    if (status === 'running') {
      updateData.startedAt = now;
    } else if (status === 'completed' || status === 'failed') {
      updateData.completedAt = now;
    }

    await prisma.fuzzTask.update({
      where: { id: this.config.taskId },
      data: updateData
    });
  }
}
