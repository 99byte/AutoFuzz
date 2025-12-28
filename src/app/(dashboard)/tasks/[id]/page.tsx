'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { TestFlowCanvas } from '@/components/flow/TestFlowCanvas';
import { ControlPanel } from '@/components/flow/ControlPanel';
import { useEventSource } from '@/hooks/useEventSource';
import { useFlowState } from '@/hooks/useFlowState';

export default function TaskMonitorPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });
  const [crashes, setCrashes] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const { events, connected } = useEventSource(`/api/tasks/${taskId}/stream`);
  const flowState = useFlowState();

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    for (const event of events) {
      const logMessage = `[${new Date().toLocaleTimeString()}] ${JSON.stringify(event)}`;
      setLogs(prev => [...prev.slice(-50), logMessage]);

      switch (event.type) {
        case 'test_cases_generated':
          setCurrentProgress({ current: 0, total: event.count });
          break;
        case 'test_case_started':
          setCurrentProgress({ current: event.index, total: event.total });
          break;
        case 'crash_detected':
          setCrashes(event.totalCrashes);
          if (event.crash) {
            setTask((prev: any) => ({
              ...prev,
              crashReports: [event.crash, ...(prev?.crashReports || [])]
            }));
          }
          break;
        case 'task_completed':
        case 'task_failed':
          fetchTask();
          break;
        case 'action_completed_with_state':
        case 'test_case_completed':
        case 'crash_with_state':
          flowState.handleEvent(event);
          break;
      }
    }
  }, [events, flowState]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json();
      setTask(data);
    } catch (error) {
      console.error('获取任务详情失败:', error);
    }
  };

  const handleStart = async () => {
    await fetch(`/api/tasks/${taskId}/start`, { method: 'POST' });
    fetchTask();
  };

  const handleStop = async () => {
    await fetch(`/api/tasks/${taskId}/stop`, { method: 'POST' });
    fetchTask();
  };

  if (!task) {
    return (
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  const visibleNodes = flowState.getVisibleNodes();
  const edges = flowState.calculateEdges();

  return (
    <ReactFlowProvider>
      {/* 使用固定定位让内容铺满整个屏幕（导航栏下方） */}
      <div className="fixed top-16 left-0 right-0 bottom-0 flex bg-muted/30">
        {/* 左侧：流程画布 */}
        <div className="flex-1 relative overflow-hidden bg-card rounded-lg border">
          <TestFlowCanvas
            nodes={visibleNodes}
            edges={edges}
            viewport={flowState.viewport}
            onViewportChange={flowState.setViewport}
            onToggleCollapse={flowState.toggleCollapse}
            onClear={flowState.clearNodes}
            onFitView={() => flowState.setViewport({ x: 0, y: 0, zoom: 1 })}
          />
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-96 bg-card border-l overflow-hidden flex flex-col shadow-xl z-20">
          <ControlPanel
            task={task}
            currentProgress={currentProgress}
            crashes={crashes}
            logs={logs}
            connected={connected}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
