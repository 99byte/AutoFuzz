'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LogTerminal } from '@/components/LogTerminal';
import { Play, Square } from 'lucide-react';

interface ControlPanelProps {
  task: any;
  currentProgress: { current: number; total: number };
  crashes: number;
  logs: string[];
  connected: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const ControlPanel = memo(({
  task,
  currentProgress,
  crashes,
  logs,
  connected,
  onStart,
  onStop
}: ControlPanelProps) => {
  const progressPercent = currentProgress.total > 0
    ? (currentProgress.current / currentProgress.total) * 100
    : 0;

  return (
    <div className="flex flex-col gap-3 h-full overflow-auto">
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">任务控制</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-3 pb-3">
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button onClick={onStart} className="flex-1 text-xs h-8">
                <Play className="h-3 w-3 mr-1" />
                启动
              </Button>
            )}
            {task.status === 'running' && (
              <Button variant="destructive" onClick={onStop} className="flex-1 text-xs h-8">
                <Square className="h-3 w-3 mr-1" />
                停止
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={task.status === 'running' ? 'secondary' : 'default'} className="text-[10px]">
              {task.status}
            </Badge>
            <Badge variant={connected ? 'outline' : 'destructive'} className="text-[10px]">
              {connected ? 'SSE已连接' : 'SSE断开'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">统计概览</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-1.5 bg-slate-50 rounded text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">测试进度</div>
              <div className="text-sm font-bold">
                {currentProgress.current} / {currentProgress.total}
              </div>
            </div>

            <div className="p-1.5 bg-slate-50 rounded text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">崩溃次数</div>
              <div className="text-sm font-bold text-red-500">{crashes}</div>
            </div>

            <div className="p-1.5 bg-slate-50 rounded text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">完成率</div>
              <div className="text-sm font-bold">{progressPercent.toFixed(1)}%</div>
            </div>

            <div className="p-1.5 bg-slate-50 rounded text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">SSE连接</div>
              <div className="text-sm font-bold">
                {connected ? '✅' : '❌'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm">测试进度</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Progress value={progressPercent} />
          <p className="mt-1 text-[10px] text-slate-500">
            完成度: {progressPercent.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <LogTerminal logs={logs} />

      {task.crashReports && task.crashReports.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm text-red-600">崩溃报告</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-2 max-h-40 overflow-auto">
              {task.crashReports.map((crash: any) => (
                <div key={crash.id} className="border rounded p-2">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="destructive" className="text-[10px]">{crash.crashType}</Badge>
                    <span className="text-[10px] text-slate-500">
                      {new Date(crash.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  {crash.stackTrace && (
                    <pre className="text-[10px] bg-slate-100 p-1 rounded overflow-auto max-h-14">
                      {crash.stackTrace.slice(0, 300)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';
