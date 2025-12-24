import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface ScreenshotConfig {
  taskId: string;
  testCaseIndex: number;
  actionIndex: number;
}

export const SCREENSHOT_WAIT_TIME: Record<string, number> = {
  'Launch': 3000,
  'Tap': 1000,
  'Type': 500,
  'Swipe': 1500,
  'Back': 1000,
  'Home': 2000,
  'LongPress': 1200,
  'Wait': 0
};

export class ScreenshotManager {
  private taskId: string;
  private screenshotDir: string;
  private baseUrl: string;

  constructor(taskId: string) {
    this.taskId = taskId;
    this.screenshotDir = path.join(process.cwd(), 'public', 'screenshots', taskId);
    this.baseUrl = `/screenshots/${taskId}`;
  }

  async init(): Promise<void> {
    await fs.mkdir(this.screenshotDir, { recursive: true });
  }

  async captureStartScreenshot(testCaseIndex: number): Promise<string> {
    const filename = `test_${testCaseIndex}_start.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.captureToFile(filepath);
    return `${this.baseUrl}/${filename}`;
  }

  async captureActionScreenshot(
    testCaseIndex: number,
    actionIndex: number
  ): Promise<string> {
    const filename = `test_${testCaseIndex}_action_${actionIndex}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.captureToFile(filepath);
    return `${this.baseUrl}/${filename}`;
  }

  async captureFinalScreenshot(testCaseIndex: number): Promise<string> {
    const filename = `test_${testCaseIndex}_final.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.captureToFile(filepath);
    return `${this.baseUrl}/${filename}`;
  }

  async captureWithWait(
    actionType: string,
    callback?: () => Promise<void>
  ): Promise<string> {
    const waitTime = SCREENSHOT_WAIT_TIME[actionType] || 1000;

    if (callback) {
      await callback();
    }

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const filename = `temp_${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.captureToFile(filepath);
    return `${this.baseUrl}/${filename}`;
  }

  private async captureToFile(filepath: string): Promise<void> {
    try {
      await execAsync(`adb shell screencap -p > "${filepath}"`);
    } catch (error) {
      console.error('截图失败:', error);
      throw new Error(`截图失败: ${(error as Error).message}`);
    }
  }

  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.screenshotDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.screenshotDir, file)))
      );
    } catch (error) {
      console.error('清理截图失败:', error);
    }
  }
}
