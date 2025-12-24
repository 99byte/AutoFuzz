import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tasks = await prisma.fuzzTask.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      result: true,
      crashReports: true,
      _count: {
        select: { crashReports: true }
      }
    }
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const task = await prisma.fuzzTask.create({
      data: {
        name: body.name,
        targetApp: body.targetApp,
        appDescription: body.appDescription || null,
        testCases: JSON.stringify([]),
        testConfig: JSON.stringify(body.testConfig || {}),
        status: 'pending'
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: '创建任务失败', message: (error as Error).message },
      { status: 500 }
    );
  }
}
