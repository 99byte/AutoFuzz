import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const activeRunners = new Map<string, any>();

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

  if (task.status !== 'running') {
    return NextResponse.json({ error: '任务未在运行' }, { status: 400 });
  }

  const runner = activeRunners.get(taskId);
  if (runner) {
    runner.stop();
    activeRunners.delete(taskId);
  }

  await prisma.fuzzTask.update({
    where: { id: taskId },
    data: { status: 'failed', completedAt: new Date() }
  });

  return NextResponse.json({ message: '任务已停止' });
}
