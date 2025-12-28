import { AutoGLMConfig, FuzzAction, FuzzResult } from '@/types/autoglm';
import { HDCMonitor } from './hdc';

export class AutoGLMFuzzer {
  private config: AutoGLMConfig;
  private hdc: HDCMonitor;

  constructor(config: AutoGLMConfig) {
    this.config = config;
    // We assume targetApp in config is the bundleName
    this.hdc = new HDCMonitor('placeholder');
    // Note: The monitor might need to be initialized per task or passed in. 
    // Here we will instantiate it ad-hoc or allow passing it. 
    // For now, let's keep the structure but change execution logic.
  }

  // Environment check for HDC
  async checkEnvironment(): Promise<boolean> {
    try {
      const devices = await HDCMonitor.getDevices();
      return devices.length > 0;
    } catch (error) {
      console.error('HDC环境检查失败:', error);
      return false;
    }
  }

  async executeAction(action: FuzzAction, bundleName?: string): Promise<FuzzResult> {
    // Update monitor if bundle name provided
    if (bundleName && (this.hdc as any).bundleName !== bundleName) {
      this.hdc = new HDCMonitor(bundleName);
    }

    try {
      switch (action.action) {
        case 'Launch':
          // Launch requires Ability name, usually inferred or passed in params
          // If not provided, try defaults
          const ability = action.params.element || 'EntryAbility';
          await this.hdc.launchApp(ability);
          break;

        case 'Tap':
          const coords = action.params.element?.split(' ') || ['500', '500'];
          if (coords.length === 2) {
            await this.hdc.tap(parseInt(coords[0]), parseInt(coords[1]));
          }
          break;

        case 'Type':
          if (action.params.text) {
            await this.hdc.inputText(action.params.text);
          }
          break;

        case 'Swipe':
          // "500 500 500 0" -> x1 y1 x2 y2
          // Or directions
          let x1 = 500, y1 = 800, x2 = 500, y2 = 200;
          const dir = action.params.direction;

          if (dir === 'up') { y1 = 800; y2 = 200; }
          else if (dir === 'down') { y1 = 200; y2 = 800; }
          else if (dir === 'left') { x1 = 800; x2 = 200; y1 = 500; y2 = 500; }
          else if (dir === 'right') { x1 = 200; x2 = 800; y1 = 500; y2 = 500; }
          else if (action.params.element) {
            // assume explicit coords string "x1 y1 x2 y2"
            const parts = action.params.element.split(' ').map(Number);
            if (parts.length === 4) {
              [x1, y1, x2, y2] = parts;
            }
          }
          await this.hdc.swipe(x1, y1, x2, y2);
          break;

        case 'Back':
          await this.hdc.back();
          break;

        case 'Home':
          await this.hdc.home();
          break;

        case 'LongPress':
          // Swipe with long duration for long press simulation?
          // Or if uinput has specific long press support. 
          // Using micro-swipe or stationary swipe for duration
          const [lpX, lpY] = (action.params.element?.split(' ') || ['500', '500']).map(Number);
          const duration = action.params.duration || 1000;
          // Stationary swipe
          await this.hdc.swipe(lpX, lpY, lpX, lpY, duration);
          break;

        case 'Wait':
          const waitTime = action.params.duration || 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          break;

        default:
          return {
            success: false,
            action,
            error: `未知动作类型: ${action.action}`,
            timestamp: Date.now()
          };
      }

      return {
        success: true,
        action,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('执行动作失败:', error);
      return {
        success: false,
        action,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }

  async getScreenshot(savePath: string): Promise<string> {
    try {
      await this.hdc.snapshot(savePath);
      return savePath;
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  }
}
