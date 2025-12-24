'use client';

import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';

interface TooltipProps {
  node: {
    testCaseIndex?: number;
    actionIndex?: number;
    actionType?: string;
    actionDescription?: string;
    timestamp?: number;
    duration?: number;
    success?: boolean;
    status?: string;
    totalActions?: number;
    successCount?: number;
    failedCount?: number;
    crashCount?: number;
    totalDuration?: number;
    position?: { x: number; y: number };
  };
  visible: boolean;
  onClose: () => void;
}

export const NodeTooltip = memo(({ node, visible, onClose }: TooltipProps) => {
  if (!visible) return null;

  const time = node.timestamp
    ? new Date(node.timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : '-';

  const duration = node.duration ? `${(node.duration / 1000).toFixed(1)}s` : '-';

  const isTestCaseSummary = node.totalActions !== undefined;

  return (
    <Card className="fixed z-50 w-[280px] bg-slate-800 text-slate-100 border-slate-700 shadow-xl">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {isTestCaseSummary
              ? `📦 测试用例 #${(node.testCaseIndex || 0) + 1}`
              : `📱 ${node.actionDescription || '未知动作'}`}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="h-px bg-slate-700" />

        <div className="space-y-2 text-xs">
          {!isTestCaseSummary && (
            <>
              {node.testCaseIndex !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">测试用例:</span>
                  <span className="font-medium">#{node.testCaseIndex + 1}</span>
                </div>
              )}
              {node.actionIndex !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">动作索引:</span>
                  <span className="font-medium">#{node.actionIndex + 1}</span>
                </div>
              )}
              {node.actionType && (
                <div className="flex justify-between">
                  <span className="text-slate-400">动作类型:</span>
                  <span className="font-medium">{node.actionType}</span>
                </div>
              )}
              {node.status !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">状态:</span>
                  <span className={`font-medium ${
                    node.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {node.success ? '✅ 成功' : '❌ 失败'}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between">
            <span className="text-slate-400">执行时间:</span>
            <span className="font-medium">{time}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">耗时:</span>
            <span className="font-medium">{duration}</span>
          </div>

          {isTestCaseSummary && (
            <>
              <div className="h-px bg-slate-700 my-2" />
              <div className="flex justify-between">
                <span className="text-slate-400">总动作数:</span>
                <span className="font-medium">{node.totalActions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">成功:</span>
                <span className="font-medium text-green-400">{node.successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">失败:</span>
                <span className="font-medium text-yellow-400">{node.failedCount}</span>
              </div>
              {(node.crashCount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">崩溃:</span>
                  <span className="font-medium text-red-400">{node.crashCount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">总耗时:</span>
                <span className="font-medium">{(node.totalDuration || 0) / 1000}s</span>
              </div>
            </>
          )}
        </div>

        <div className="h-px bg-slate-700" />

        <button className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center">
          查看详细日志 →
        </button>
      </div>
    </Card>
  );
});

NodeTooltip.displayName = 'NodeTooltip';
