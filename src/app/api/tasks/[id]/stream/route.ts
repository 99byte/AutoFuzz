import { NextRequest } from 'next/server';
import { Readable } from 'stream';
import { addStream, removeStream } from '@/lib/stream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  const stream = new Readable({
    read() {}
  });

  addStream(taskId, stream);

  request.signal.addEventListener('abort', () => {
    removeStream(taskId, stream);
    stream.push(null);
  });

  // 将 Node.js Readable 转换为 Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on('end', () => {
        controller.close();
      });
      stream.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      stream.destroy();
    }
  });

  return new Response(webStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
