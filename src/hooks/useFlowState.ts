'use client';

import { useState, useCallback, useEffect } from 'react';
import { TestStateNode, TestCaseSummary, FlowState, FlowEvent } from '@/types/flow';

export function useFlowState() {
  const [nodes, setNodes] = useState<TestStateNode[]>([]);
  const [testCaseSummaries, setTestCaseSummaries] = useState<TestCaseSummary[]>([]);
  const [testCaseCollapsed, setTestCaseCollapsed] = useState<Map<number, boolean>>(new Map());
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  const toggleCollapse = useCallback((testCaseIndex: number) => {
    setTestCaseCollapsed((prev) => {
      const newMap = new Map(prev);
      newMap.set(testCaseIndex, !newMap.get(testCaseIndex));
      return newMap;
    });
  }, []);

  const handleEvent = useCallback((event: FlowEvent) => {
    switch (event.type) {
      case 'action_completed_with_state': {
        const newNode: TestStateNode = {
          id: `node-${event.testCaseIndex}-${event.actionIndex}`,
          type: 'actionNode',
          testCaseIndex: event.testCaseIndex,
          actionIndex: event.actionIndex,
          actionType: event.action.type,
          actionDescription: event.action.description,
          screenshotUrl: event.screenshotUrl,
          timestamp: event.timestamp,
          duration: event.duration,
          success: event.success,
          status: event.status,
          position: {
            x: event.testCaseIndex * 220 + 40,
            y: (event.actionIndex + 1) * 280 + 40
          },
          data: event as unknown as Record<string, unknown>
        };

        setNodes((prev) => {
          const exists = prev.find(
            (n) => n.testCaseIndex === event.testCaseIndex && n.actionIndex === event.actionIndex
          );
          if (exists) {
            return prev.map((n) =>
              n.testCaseIndex === event.testCaseIndex && n.actionIndex === event.actionIndex
                ? newNode
                : n
            );
          }
          return [...prev, newNode];
        });
        break;
      }

      case 'test_case_completed': {
        const summary: TestCaseSummary = {
          id: `summary-${event.testCaseIndex}`,
          testCaseIndex: event.testCaseIndex,
          totalActions: event.totalActions,
          successCount: event.successCount,
          failedCount: event.failedCount,
          crashCount: event.crashCount,
          totalDuration: event.totalDuration,
          finalScreenshotUrl: event.finalScreenshotUrl,
          isCollapsed: false,
          position: {
            x: event.testCaseIndex * 220 + 40,
            y: 40
          }
        };

        setTestCaseSummaries((prev) => {
          const exists = prev.find((s) => s.testCaseIndex === event.testCaseIndex);
          if (exists) {
            return prev.map((s) =>
              s.testCaseIndex === event.testCaseIndex ? summary : s
            );
          }
          return [...prev, summary];
        });

        if (!testCaseCollapsed.has(event.testCaseIndex)) {
          testCaseCollapsed.set(event.testCaseIndex, false);
        }
        break;
      }

      case 'crash_with_state': {
        const crashNode: TestStateNode = {
          id: `crash-${event.testCaseIndex}-${event.actionIndex}`,
          type: 'crashNode',
          testCaseIndex: event.testCaseIndex,
          actionIndex: event.actionIndex,
          actionType: 'Crash',
          actionDescription: '应用崩溃',
          screenshotUrl: event.screenshotUrl,
          timestamp: event.timestamp,
          duration: 0,
          success: false,
          status: 'crashed',
          position: {
            x: event.testCaseIndex * 220 + 40,
            y: (event.actionIndex + 1) * 280 + 40
          },
          data: event as unknown as Record<string, unknown>
        };

        setNodes((prev) => {
          const exists = prev.find(
            (n) => n.testCaseIndex === event.testCaseIndex && n.actionIndex === event.actionIndex
          );
          if (exists) {
            return prev.map((n) =>
              n.testCaseIndex === event.testCaseIndex && n.actionIndex === event.actionIndex
                ? crashNode
                : n
            );
          }
          return [...prev, crashNode];
        });
        break;
      }
    }
  }, [testCaseCollapsed]);

  const clearNodes = useCallback(() => {
    setNodes([]);
    setTestCaseSummaries([]);
    setTestCaseCollapsed(new Map());
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const getVisibleNodes = useCallback((): (TestStateNode | TestCaseSummary)[] => {
    const visible: (TestStateNode | TestCaseSummary)[] = [];

    testCaseSummaries.forEach((summary) => {
      const isCollapsed = testCaseCollapsed.get(summary.testCaseIndex);

      if (isCollapsed) {
        visible.push(summary);
      } else {
        const actionNodes = nodes.filter(
          (node) => node.testCaseIndex === summary.testCaseIndex
        );
        const sortedNodes = actionNodes.sort((a, b) => a.actionIndex - b.actionIndex);
        visible.push(...sortedNodes);
      }
    });

    return visible;
  }, [testCaseSummaries, testCaseCollapsed, nodes]);

  const calculateEdges = useCallback(() => {
    const edges: any[] = [];
    const visibleNodes = getVisibleNodes();

    for (let i = 0; i < visibleNodes.length - 1; i++) {
      const current = visibleNodes[i];
      const next = visibleNodes[i + 1];

      let sourceId: string;
      let targetId: string;
      let animated = false;
      let style: React.CSSProperties = { stroke: '#94a3b8', strokeWidth: 2 };
      let type = 'smoothstep' as const;

      if ('actionIndex' in current) {
        sourceId = current.id;
      } else {
        sourceId = current.id;
      }

      if ('actionIndex' in next) {
        targetId = next.id;
        if (next.status === 'completed') {
          style = { stroke: '#22c55e', strokeWidth: 2 };
          animated = true;
        } else if (next.status === 'failed') {
          style = { stroke: '#fbbf24', strokeWidth: 2, strokeDasharray: '5,5' };
        } else if (next.status === 'crashed') {
          style = { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' };
        }
      } else {
        targetId = next.id;
      }

      edges.push({
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type,
        animated,
        style
      });
    }

    return edges;
  }, [getVisibleNodes]);

  return {
    nodes,
    testCaseSummaries,
    testCaseCollapsed,
    viewport,
    handleEvent,
    toggleCollapse,
    clearNodes,
    resetViewport,
    getVisibleNodes,
    calculateEdges,
    setViewport
  };
}
