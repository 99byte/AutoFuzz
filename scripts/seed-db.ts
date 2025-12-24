import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据库...');

  const task = await prisma.fuzzTask.create({
    data: {
      name: '示例任务 - 微信压力测试',
      targetApp: 'com.tencent.mm',
      appDescription: '微信是一款社交通讯应用，支持聊天、朋友圈、小程序等功能',
      testCases: JSON.stringify([
        {
          id: '1',
          description: '打开微信并查看朋友圈',
          category: '浏览',
          actions: [
            { action: 'Launch', description: '启动微信', params: { app: 'com.tencent.mm' } },
            { action: 'Tap', description: '点击发现', params: { element: '发现' } },
            { action: 'Tap', description: '点击朋友圈', params: { element: '朋友圈' } }
          ],
          expectedBehavior: '成功进入朋友圈页面',
          crashProbability: 'low'
        }
      ]),
      testConfig: JSON.stringify({
        testDepth: 10,
        focusAreas: ['聊天', '朋友圈', '小程序']
      }),
      status: 'pending'
    }
  });

  console.log(`创建示例任务: ${task.id}`);

  const result = await prisma.testResult.create({
    data: {
      taskId: task.id,
      totalCases: 10,
      passedCases: 8,
      failedCases: 2,
      crashCount: 0,
      timeoutCount: 0,
      executionTime: 300,
      summary: JSON.stringify({
        message: '这是一个示例任务的数据'
      })
    }
  });

  console.log(`创建示例结果: ${result.id}`);

  console.log('✅ 数据库填充完成');
}

main()
  .catch((e) => {
    console.error('❌ 填充数据库失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
