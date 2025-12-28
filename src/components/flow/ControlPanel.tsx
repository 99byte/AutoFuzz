'use client';

import { memo, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LogTerminal } from '@/components/LogTerminal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, AlertTriangle, CheckCircle2, Clock, Terminal, Activity } from 'lucide-react';
import { FuzzTask, CrashReport } from '@/types/task';

interface ControlPanelProps {
  task: FuzzTask;
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
  const [activeTab, setActiveTab] = useState('overview');

  const progressPercent = currentProgress.total > 0
    ? (currentProgress.current / currentProgress.total) * 100
    : 0;

  const testCases = useMemo(() => {
    try {
      return JSON.parse(task.testCases || '[]');
    } catch (e) {
      return [];
    }
  }, [task.testCases]);

  const testConfig = useMemo(() => {
    try {
      return JSON.parse(task.testConfig || '{}');
    } catch (e) {
      return {};
    }
  }, [task.testConfig]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 顶部固定区域：状态与控制 */}
      <div className="p-4 border-b space-y-4 shrink-0 bg-card z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={task.status === 'running' ? 'default' : 'secondary'} className="animate-in fade-in">
              {task.status === 'running' && <span className="mr-1.5 h-2 w-2 rounded-full bg-white animate-pulse" />}
              {task.status}
            </Badge>
            <Badge variant={connected ? 'outline' : 'destructive'} className="text-[10px]">
              {connected ? 'SSE 已连接' : 'SSE 断开'}
            </Badge>
          </div>
          <div className="flex gap-2">
            {task.status !== 'running' ? (
              <Button onClick={onStart} size="sm" className="h-8 px-3">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                启动
              </Button>
            ) : (
              <Button variant="destructive" onClick={onStop} size="sm" className="h-8 px-3">
                <Square className="h-3.5 w-3.5 mr-1.5" />
                停止
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>总进度</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b bg-muted/20 flex justify-center">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="logs">日志</TabsTrigger>
            <TabsTrigger value="crashes" className="relative">
              崩溃
              {crashes > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {crashes}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: 概览 */}
        <TabsContent value="overview" className="flex-1 overflow-auto p-4 space-y-4 mt-0">
          {/* 这里可以放核心指标 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg border text-center">
              <div className="text-xs text-muted-foreground mb-1">已执行</div>
              <div className="text-xl font-bold font-mono">
                {currentProgress.current}<span className="text-sm text-muted-foreground">/{currentProgress.total}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg border text-center ${crashes > 0 ? 'bg-red-50 border-red-200' : 'bg-muted/50'}`}>
              <div className="text-xs text-muted-foreground mb-1">发现崩溃</div>
              <div className={`text-xl font-bold font-mono ${crashes > 0 ? 'text-red-600' : ''}`}>
                {crashes}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-primary" />
              测试用例列表
            </div>
            <div className="space-y-2">
              {testCases.map((tc: any, index: number) => {
                const isCompleted = index < currentProgress.current;
                const isRunning = index === currentProgress.current && task.status === 'running';

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-md border text-sm transition-colors ${isRunning ? 'bg-primary/5 border-primary' : 'bg-card'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium mb-1 line-clamp-1">
                          {tc.description || `测试用例 #${index + 1}`}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {/* 假设 test case 数据里有 more details，如果没有就显示 action count */}
                          预计步骤: {tc.actions?.length || 0} 步
                        </div>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isRunning ? (
                          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {testCases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  暂无测试用例数据
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>应用包名</span>
              <span className="font-mono">{task.targetApp}</span>
            </div>
            <div className="flex justify-between">
              <span>测试深度</span>
              <span>{testConfig.testDepth || '-'}</span>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: 日志 */}
        <TabsContent value="logs" className="flex-1 overflow-hidden mt-0 flex flex-col">
          <LogTerminal logs={logs} />
        </TabsContent>

        {/* Tab 3: 崩溃 */}
        <TabsContent value="crashes" className="flex-1 overflow-auto p-4 mt-0">
          {task.crashReports && task.crashReports.length > 0 ? (
            <div className="space-y-3">
              {task.crashReports.map((crash: CrashReport) => (
                <Card key={crash.id} className="border-red-200 shadow-sm">
                  <CardHeader className="p-3 bg-red-50/50 pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="destructive" className="rounded-sm">
                        {crash.crashType}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(crash.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-xs font-medium mb-2">{crash.package}</p>
                    {crash.stackTrace && (
                      <div className="bg-slate-950 text-slate-50 p-2 rounded text-[10px] font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                        {crash.stackTrace.slice(0, 500)}...
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4 opacity-20" />
              <p className="text-sm">暂无发现崩溃</p>
              <p className="text-xs opacity-70 mt-1">应用运行状况良好</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';
