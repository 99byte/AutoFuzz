import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FuzzTaskRunner } from '@/lib/fuzz-runner';

const activeRunners = new Map<string, FuzzTaskRunner>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  const task = await prisma.fuzzTask.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  if (task.status === 'running') {
    return NextResponse.json({ error: '任务已在运行中' }, { status: 400 });
  }

  const testConfig = JSON.parse(task.testConfig);

  const runner = new FuzzTaskRunner({
    taskId,
    targetApp: task.targetApp,
    appDescription: task.appDescription || '',
    testDepth: testConfig.testDepth || 10,
    focusAreas: testConfig.focusAreas || []
  });

  activeRunners.set(taskId, runner);

  runner.run().catch(error => {
    console.error('Fuzz任务执行失败:', error);
    activeRunners.delete(taskId);
  });

  return NextResponse.json({ message: '任务已启动', taskId });
}
