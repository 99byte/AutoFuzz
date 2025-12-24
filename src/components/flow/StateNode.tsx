'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface BaseNodeProps {
  title: string;
  subtitle: string;
  screenshotUrl: string;
  status: 'completed' | 'failed' | 'crashed';
  timestamp: string;
  duration: string;
  children?: React.ReactNode;
}

export const BaseNode = memo(({
  title,
  subtitle,
  screenshotUrl,
  status,
  timestamp,
  duration,
  children
}: BaseNodeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-slate-200';
      case 'failed':
        return 'border-yellow-500 border-l-4';
      case 'crashed':
        return 'border-red-500 border-l-4 bg-red-50';
      default:
        return 'border-slate-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '⚠️';
      case 'crashed':
        return '💥';
      default:
        return '⏳';
    }
  };

  return (
    <Card className={`w-[180px] bg-white shadow-lg ${getStatusColor()}`}>
      <div className="p-2 space-y-1.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-900 truncate">{title}</span>
            <span className="text-xs">{getStatusIcon()}</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>
        </div>

        <div className="relative w-full h-[110px] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
          <Image
            src={screenshotUrl}
            alt="截图"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">{getStatusIcon()} {status === 'completed' ? '成功' : status === 'failed' ? '失败' : '崩溃'}</span>
          <span>⏱️ {duration}</span>
        </div>

        {children && (
          <div className="pt-1.5 border-t border-slate-200">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
});

BaseNode.displayName = 'BaseNode';
