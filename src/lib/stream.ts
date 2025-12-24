import { Readable } from 'stream';

const taskStreams = new Map<string, Set<Readable>>();

export function streamToClient(taskId: string, data: any): void {
  const streams = taskStreams.get(taskId);
  if (!streams) return;

  const message = `data: ${JSON.stringify(data)}\n\n`;

  streams.forEach(stream => {
    try {
      stream.push(message);
    } catch (error) {
      console.error('SSE发送消息失败:', error);
    }
  });
}

export function addStream(taskId: string, stream: Readable): void {
  if (!taskStreams.has(taskId)) {
    taskStreams.set(taskId, new Set());
  }
  taskStreams.get(taskId)!.add(stream);
}

export function removeStream(taskId: string, stream: Readable): void {
  const streams = taskStreams.get(taskId);
  if (!streams) return;

  streams.delete(stream);

  if (streams.size === 0) {
    taskStreams.delete(taskId);
  }
}

export function getActiveTaskIds(): string[] {
  return Array.from(taskStreams.keys());
}
