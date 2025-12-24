'use client';

import { memo } from 'react';
import { BaseNode } from '../StateNode';
import { TestStateNode } from '@/types/flow';

interface ActionNodeProps {
  data: TestStateNode;
}

export const ActionNode = memo(({ data }: ActionNodeProps) => {
  const time = new Date(data.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const actionTypeIcon = {
    'Launch': '🚀',
    'Tap': '👆',
    'Type': '⌨️',
    'Swipe': '👉',
    'Back': '⬅️',
    'Home': '🏠',
    'LongPress': '👆',
    'Wait': '⏳'
  }[data.actionType] || '▶️';

  return (
    <BaseNode
      title={`${actionTypeIcon} ${data.actionDescription}`}
      subtitle={`测试用例 #${data.testCaseIndex + 1} - 动作 #${data.actionIndex + 1}`}
      screenshotUrl={data.screenshotUrl}
      status={data.status}
      timestamp={time}
      duration={`${(data.duration / 1000).toFixed(1)}s`}
    />
  );
});

ActionNode.displayName = 'ActionNode';
