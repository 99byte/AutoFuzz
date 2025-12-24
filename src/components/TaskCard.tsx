'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types/task';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    name: string;
    targetApp: string;
    status: TaskStatus;
    createdAt: Date;
    crashReports?: any[];
  };
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'running':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Clock className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{task.name}</CardTitle>
          <Badge variant={getStatusColor(task.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(task.status)}
              {task.status}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>应用包名:</span>
            <span className="font-mono">{task.targetApp}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              创建时间:
            </span>
            <span>{new Date(task.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          {task.crashReports && task.crashReports.length > 0 && (
            <div className="flex justify-between items-center text-red-600">
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                崩溃数:
              </span>
              <span className="font-semibold">{task.crashReports.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
