'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Maximize, Trash2 } from 'lucide-react';

interface ViewControlsProps {
  onFitView: () => void;
  onResetView: () => void;
  onClear: () => void;
}

export const ViewControls = memo(({ onFitView, onResetView, onClear }: ViewControlsProps) => {
  return (
    <Card className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg z-10">
      <div className="p-2 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFitView}
          className="w-8 h-8 p-0"
          title="适应屏幕"
        >
          <Maximize className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onResetView}
          className="w-8 h-8 p-0"
          title="重置视图"
        >
          <Home className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="w-8 h-8 p-0"
          title="清空画布"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
});

ViewControls.displayName = 'ViewControls';
