'use client';

import { memo } from 'react';
import { BaseNode } from '../StateNode';
import { Badge } from '@/components/ui/badge';
import { TestStateNode } from '@/types/flow';

interface CrashNodeProps {
  data: TestStateNode & {
    crash?: {
      type: string;
      package: string;
      stackTrace?: string;
      severity: string;
    };
  };
}

export const CrashNode = memo(({ data }: CrashNodeProps) => {
  const time = new Date(data.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <BaseNode
      title={`💥 崩溃: ${data.crash?.type || 'Unknown'}`}
      subtitle={`测试用例 #${data.testCaseIndex + 1} - 动作 #${data.actionIndex + 1}`}
      screenshotUrl={data.screenshotUrl}
      status="crashed"
      timestamp={time}
      duration={`${(data.duration / 1000).toFixed(1)}s`}
    >
      <div className="text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-red-600 font-medium">严重程度:</span>
          <Badge variant="destructive" className="text-xs">{data.crash?.severity || 'high'}</Badge>
        </div>
        <div className="text-slate-500 break-all">
          <span className="font-medium">包名:</span> {data.crash?.package || 'unknown'}
        </div>
      </div>
    </BaseNode>
  );
});

CrashNode.displayName = 'CrashNode';
