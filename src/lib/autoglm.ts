import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { AutoGLMConfig, FuzzAction, FuzzResult } from '@/types/autoglm';

const execAsync = promisify(exec);

export class AutoGLMFuzzer {
  private config: AutoGLMConfig;
  private pythonPath: string;

  constructor(config: AutoGLMConfig) {
    this.config = config;
    const isWindows = process.platform === 'win32';
    this.pythonPath = path.join(
      process.cwd(),
      'autoglm-env',
      isWindows ? 'Scripts' : 'bin',
      isWindows ? 'python.exe' : 'python'
    );
  }

  async checkEnvironment(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `${this.pythonPath} -c "import phone_agent; print('OK')"`
      );
      return stdout.trim() === 'OK';
    } catch (error) {
      console.error('AutoGLM环境检查失败:', error);
      return false;
    }
  }

  async checkDevice(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('adb devices');
      const lines = stdout.trim().split('\n').slice(1);
      return lines.some(line => line.includes('\tdevice'));
    } catch (error) {
      console.error('ADB设备检查失败:', error);
      return false;
    }
  }

  async executeAction(action: FuzzAction): Promise<FuzzResult> {
    try {
      let command = '';
      
      switch (action.action) {
        case 'Launch':
          command = `adb shell monkey -p ${action.params.app} -c android.intent.category.LAUNCHER 1`;
          break;
        case 'Tap':
          command = `adb shell input tap ${action.params.element || '500 500'}`;
          break;
        case 'Type':
          command = `adb shell input text "${action.params.text}"`;
          break;
        case 'Swipe':
          const dir = action.params.direction || 'up';
          const swipeCmd = {
            'up': '0 500 500 0',
            'down': '0 0 500 500',
            'left': '500 250 0 250',
            'right': '0 250 500 250'
          };
          command = `adb shell input swipe ${swipeCmd[dir as keyof typeof swipeCmd]}`;
          break;
        case 'Back':
          command = 'adb shell input keyevent KEYCODE_BACK';
          break;
        case 'Home':
          command = 'adb shell input keyevent KEYCODE_HOME';
          break;
        case 'LongPress':
          command = `adb shell input swipe ${action.params.element || '500 500'} ${action.params.element || '500 500'} ${action.params.duration || 1000}`;
          break;
        case 'Wait':
          const duration = action.params.duration || 1000;
          await new Promise(resolve => setTimeout(resolve, duration));
          return {
            success: true,
            action,
            timestamp: Date.now()
          };
        default:
          return {
            success: false,
            action,
            error: `未知动作类型: ${action.action}`,
            timestamp: Date.now()
          };
      }

      await execAsync(command);
      
      return {
        success: true,
        action,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        action,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  async executeFuzzSequence(
    targetApp: string,
    actions: FuzzAction[],
    onProgress?: (current: number, total: number, result: FuzzResult) => void
  ): Promise<FuzzResult[]> {
    const results: FuzzResult[] = [];
    
    for (let i = 0; i < actions.length; i++) {
      const result = await this.executeAction(actions[i]);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, actions.length, result);
      }
    }
    
    return results;
  }

  async getScreenshot(savePath: string): Promise<string> {
    try {
      await execAsync(`adb shell screencap -p > "${savePath}"`);
      return savePath;
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  }
}
