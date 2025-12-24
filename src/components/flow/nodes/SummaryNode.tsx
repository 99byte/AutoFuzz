'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { TestCaseSummary } from '@/types/flow';
import { ChevronDown } from 'lucide-react';

interface SummaryNodeProps {
  data: TestCaseSummary;
  onToggle?: () => void;
}

export const SummaryNode = memo(({ data, onToggle }: SummaryNodeProps) => {
  const successRate = data.totalActions > 0
    ? ((data.successCount / data.totalActions) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="w-[180px] bg-white shadow-lg border-slate-200">
      <div className="p-2 space-y-1.5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-900">
              📦 #{data.testCaseIndex + 1}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </div>

        <div className="relative w-full h-[110px] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
          <Image
            src={data.finalScreenshotUrl}
            alt="最终状态"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-500">动作:</span>
            <span className="font-medium">{data.totalActions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">成功:</span>
            <span className="font-medium text-green-600">{data.successCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600">失败:</span>
            <span className="font-medium text-yellow-600">{data.failedCount}</span>
          </div>
          {data.crashCount > 0 && (
            <div className="flex justify-between">
              <span className="text-red-600">崩溃:</span>
              <span className="font-medium text-red-600">{data.crashCount}</span>
            </div>
          )}
        </div>

        <div className="pt-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">成功率</span>
            <Badge variant="outline" className="text-[10px]">
              {successRate}%
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
});

SummaryNode.displayName = 'SummaryNode';
