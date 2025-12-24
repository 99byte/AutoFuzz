import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await prisma.fuzzTask.findUnique({
    where: { id },
    include: {
      result: true,
      crashReports: true,
      executions: {
        orderBy: { testCaseIndex: 'asc' }
      }
    }
  });

  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.fuzzTask.delete({
    where: { id }
  });

  return NextResponse.json({ message: '任务已删除' });
}
