'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LogTerminalProps {
  logs: string[];
  className?: string;
}

export function LogTerminal({ logs, className }: LogTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">执行日志</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="bg-[hsl(var(--terminal-bg))] text-[hsl(var(--terminal-text))] p-3 rounded-lg h-72 overflow-y-auto font-mono text-[10px]"
        >
          {logs.length === 0 ? (
            <div className="text-[hsl(var(--terminal-muted))]">等待日志...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-0.5 break-all leading-tight">
                {log}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
