'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Stats {
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  crashCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    crashCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">仪表板</h1>
        <p className="text-gray-500 mt-1">Fuzz测试概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-2">总任务数</div>
            <div className="text-4xl font-bold text-blue-600">
              {loading ? '-' : stats.totalTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-2">运行中</div>
            <div className="text-4xl font-bold text-orange-600">
              {loading ? '-' : stats.runningTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-2">已完成</div>
            <div className="text-4xl font-bold text-green-600">
              {loading ? '-' : stats.completedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500 mb-2">发现崩溃</div>
            <div className="text-4xl font-bold text-red-600">
              {loading ? '-' : stats.crashCount}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
