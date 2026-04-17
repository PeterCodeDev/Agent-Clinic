import { NextResponse } from 'next/server';
import { eventEmitter } from '../../../lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      eventEmitter.on('visit_created', (data) => sendEvent('visit_created', data));
      eventEmitter.on('visit_resolved', (data) => sendEvent('visit_resolved', data));
      eventEmitter.on('referral_created', (data) => sendEvent('referral_created', data));
      eventEmitter.on('chronic_flagged', (data) => sendEvent('chronic_flagged', data));

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        // We could also remove listener but here for simplicity we rely on garbage collection
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
