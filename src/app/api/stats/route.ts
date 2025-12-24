import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [totalTasks, runningTasks, completedTasks, crashCount] = await Promise.all([
    prisma.fuzzTask.count(),
    prisma.fuzzTask.count({ where: { status: 'running' } }),
    prisma.fuzzTask.count({ where: { status: 'completed' } }),
    prisma.crashReport.count()
  ]);

  return NextResponse.json({
    totalTasks,
    runningTasks,
    completedTasks,
    crashCount
  });
}
