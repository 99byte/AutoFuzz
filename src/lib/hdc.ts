import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CrashInfo {
    type: 'native_crash' | 'cpp_crash' | 'js_crash' | 'app_freeze';
    timestamp: Date;
    bundleName: string;
    stackTrace?: string;
    hilog?: string;
}

export interface DeviceInfo {
    id: string;
    status: 'connected' | 'offline';
}

export class HDCMonitor {
    private bundleName: string;
    private monitoring: boolean = false;
    private crashCallback?: (crash: CrashInfo) => void;
    private monitorInterval?: NodeJS.Timeout;

    constructor(bundleName: string) {
        this.bundleName = bundleName;
    }

    static async getDevices(): Promise<DeviceInfo[]> {
        try {
            // hdc list targets returns a list of device IDs
            const { stdout } = await execAsync('hdc list targets');
            const lines = stdout.trim().split('\n');

            // Filter out empty lines or "Empty" response if any
            if (stdout.includes('[Empty]')) return [];

            return lines
                .filter(line => line.trim() && !line.includes('List of targets'))
                .map(line => {
                    return {
                        id: line.trim(),
                        status: 'connected' // HDC only lists connected targets usually
                    };
                });
        } catch (error) {
            console.error('获取鸿蒙设备列表失败:', error);
            return [];
        }
    }

    async isAppRunning(): Promise<boolean> {
        try {
            // Using 'ps -ef' or 'aa dump' to check process
            const { stdout } = await execAsync(`hdc shell "ps -ef | grep ${this.bundleName}"`);
            return stdout.includes(this.bundleName);
        } catch {
            return false;
        }
    }

    async launchApp(abilityName: string = 'EntryAbility'): Promise<void> {
        // aa start -b <bundleName> -a <abilityName>
        try {
            await execAsync(`hdc shell aa start -b ${this.bundleName} -a ${abilityName}`);
        } catch (error) {
            console.error(`启动应用失败: ${error}`);
        }
    }

    async forceStopApp(): Promise<void> {
        await execAsync(`hdc shell aa force-stop ${this.bundleName}`);
    }

    async getHilog(clear: boolean = false): Promise<string> {
        if (clear) {
            // hilog -w start (persist) or just -r to clear? 
            // hdc shell hilog -r (clear buffer)
            await execAsync('hdc shell hilog -r');
        }

        try {
            // Get recent logs
            const { stdout } = await execAsync(`hdc shell "hilog -x | tail -n 1000"`);
            return stdout;
        } catch {
            return '';
        }
    }

    async detectCrash(): Promise<CrashInfo | null> {
        // HarmonyOS crashes often appear in separate fault logs or hilog
        // Searching specifically for "Fatal Exception" or "JS Crash" or "AppFreeze"
        const hilog = await this.getHilog();

        // JS Crash pattern
        const jsMatch = hilog.match(/JS ERROR[\s\S]*?Stacktrace:([\s\S]*?)(?=\n\n|$)/i);
        if (jsMatch) {
            return {
                type: 'js_crash',
                timestamp: new Date(),
                bundleName: this.bundleName,
                stackTrace: jsMatch[1],
                hilog: hilog.slice(-5000)
            };
        }

        // Native/CPP Crash
        if (hilog.includes('Fatal signal')) {
            const backtraceMatch = hilog.match(/Fatal signal[\s\S]*?backtrace:([\s\S]*?)(?=\n\n|$)/i);
            return {
                type: 'cpp_crash',
                timestamp: new Date(),
                bundleName: this.bundleName,
                stackTrace: backtraceMatch ? backtraceMatch[1] : 'Details in hilog',
                hilog: hilog.slice(-5000)
            };
        }

        // App Freeze
        if (hilog.includes('AppFreeze')) {
            return {
                type: 'app_freeze',
                timestamp: new Date(),
                bundleName: this.bundleName,
                hilog: hilog.slice(-5000)
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

    // Helper for uinput commands
    async tap(x: number, y: number): Promise<void> {
        // uinput -T -d x y -u
        // -T: touch, -d: down/move/up coords? 
        // Standard quick tap: hdc shell uinput -T -d x y -u x y
        await execAsync(`hdc shell uinput -T -d ${x} ${y} -u ${x} ${y}`);
    }

    async swipe(x1: number, y1: number, x2: number, y2: number, speed: number = 1000): Promise<void> {
        // uinput -S x1 y1 x2 y2 [time_ms]
        await execAsync(`hdc shell uinput -S ${x1} ${y1} ${x2} ${y2} ${speed}`);
    }

    async inputText(text: string): Promise<void> {
        // uinput -K -t <text>
        // Note: text might need escaping
        const escaped = text.replace(/"/g, '\\"');
        await execAsync(`hdc shell uinput -K -t "${escaped}"`);
    }

    async back(): Promise<void> {
        // Back key is often keycode 2 or via uinput special command? 
        // input keyevent 2
        await execAsync('hdc shell uinput -K -d 2 -u 2');
    }

    async home(): Promise<void> {
        // Home keycode 1
        await execAsync('hdc shell uinput -K -d 1 -u 1');
    }

    async snapshot(savePath: string): Promise<void> {
        // snapshot_display
        // Often saves to device first
        const devicePath = '/data/local/tmp/snapshot.png';
        await execAsync(`hdc shell snapshot_display -f ${devicePath}`);
        await execAsync(`hdc file recv ${devicePath} "${savePath}"`);
    }
}
