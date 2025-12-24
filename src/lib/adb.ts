import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CrashInfo {
  type: 'native_crash' | 'ANR' | 'java_exception' | 'process_dead';
  timestamp: Date;
  package: string;
  stackTrace?: string;
  logcat?: string;
}

export interface DeviceInfo {
  id: string;
  status: 'device' | 'offline' | 'unauthorized';
}

export class ADBMonitor {
  private packageName: string;
  private monitoring: boolean = false;
  private crashCallback?: (crash: CrashInfo) => void;
  private monitorInterval?: NodeJS.Timeout;

  constructor(packageName: string) {
    this.packageName = packageName;
  }

  static async getDevices(): Promise<DeviceInfo[]> {
    try {
      const { stdout } = await execAsync('adb devices -l');
      const lines = stdout.trim().split('\n').slice(1);
      return lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            id: parts[0],
            status: parts[1] as 'device' | 'offline' | 'unauthorized'
          };
        });
    } catch (error) {
      console.error('获取设备列表失败:', error);
      return [];
    }
  }

  async isAppRunning(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`adb shell "pidof ${this.packageName}"`);
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  async launchApp(): Promise<void> {
    await execAsync(`adb shell monkey -p ${this.packageName} -c android.intent.category.LAUNCHER 1`);
  }

  async forceStopApp(): Promise<void> {
    await execAsync(`adb shell am force-stop ${this.packageName}`);
  }

  async getLogcat(clear: boolean = false): Promise<string> {
    if (clear) {
      await execAsync('adb logcat -c');
    }
    
    try {
      const { stdout } = await execAsync(`adb logcat -d -v time`);
      return stdout;
    } catch {
      return '';
    }
  }

  async detectCrash(): Promise<CrashInfo | null> {
    const logcat = await this.getLogcat();
    
    const nativeMatch = logcat.match(/FATAL EXCEPTION.*?\n.*?backtrace:([\s\S]*?)(?=\n\n|$)/i);
    if (nativeMatch) {
      return {
        type: 'native_crash',
        timestamp: new Date(),
        package: this.packageName,
        stackTrace: nativeMatch[1],
        logcat: logcat.slice(-5000)
      };
    }
    
    const javaMatch = logcat.match(/AndroidRuntime.*?FATAL EXCEPTION.*?\n([\s\S]*?)(?=\n\n|$)/i);
    if (javaMatch) {
      return {
        type: 'java_exception',
        timestamp: new Date(),
        package: this.packageName,
        stackTrace: javaMatch[1],
        logcat: logcat.slice(-5000)
      };
    }
    
    const anrMatch = logcat.match(/ANR in.*?${this.packageName}/i);
    if (anrMatch) {
      return {
        type: 'ANR',
        timestamp: new Date(),
        package: this.packageName,
        logcat: logcat.slice(-5000)
      };
    }
    
    const isRunning = await this.isAppRunning();
    if (!isRunning) {
      return {
        type: 'process_dead',
        timestamp: new Date(),
        package: this.packageName,
        logcat: logcat.slice(-5000)
      };
    }
    
    return null;
  }

  startMonitoring(callback: (crash: CrashInfo) => void, intervalMs: number = 2000): void {
    this.monitoring = true;
    this.crashCallback = callback;
    
    this.monitorInterval = setInterval(async () => {
      if (!this.monitoring) return;
      
      const crash = await this.detectCrash();
      if (crash && this.crashCallback) {
        this.crashCallback(crash);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    this.monitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
  }
}
