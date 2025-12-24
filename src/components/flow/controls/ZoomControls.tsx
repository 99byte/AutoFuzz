'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls = memo(({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) => {
  const handleZoomIn = () => {
    if (zoom < 4) {
      onZoomIn();
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.25) {
      onZoomOut();
    }
  };

  return (
    <Card className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg z-10">
      <div className="p-2 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="w-8 h-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="text-xs text-center font-medium text-slate-700">
          {Math.round(zoom * 100)}%
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 0.25}
          className="w-8 h-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="h-px bg-slate-200" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-8 h-8 p-0"
          title="重置缩放"
        >
          <span className="text-xs">↺</span>
        </Button>
      </div>
    </Card>
  );
});

ZoomControls.displayName = 'ZoomControls';
