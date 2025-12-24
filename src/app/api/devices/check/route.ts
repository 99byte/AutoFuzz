import { NextResponse } from 'next/server';
import { ADBMonitor } from '@/lib/adb';

export async function GET() {
  try {
    const devices = await ADBMonitor.getDevices();
    
    return NextResponse.json({
      connected: devices.length > 0,
      count: devices.length,
      devices: devices
    });
  } catch (error) {
    return NextResponse.json(
      { error: '设备检查失败', message: (error as Error).message },
      { status: 500 }
    );
  }
}
