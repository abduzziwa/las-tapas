import connectToDatabase from '../models/Connection';
import { Orders } from '../models/Order';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

type Channel = 'bar' | 'waiter' | 'chef' | 'payments';

async function fetchChannelData(channel: Channel) {
  await connectToDatabase();

  switch (channel) {
    case 'bar': {
      const raw = await Orders.find({
        status: { $in: ['ordered', 'preparing'] },
        'foodItems.category': 'drink',
      }).lean();
      return raw.map((o) => ({
        ...o,
        foodItems: (o.foodItems as Array<{ category: string }>).filter(
          (item) => item.category === 'drink'
        ),
      })).filter((o) => o.foodItems.length > 0);
    }

    case 'chef': {
      const raw = await Orders.find({
        status: { $in: ['ordered', 'preparing'] },
        'foodItems.category': { $in: ['food', 'dessert'] },
      }).lean();
      return raw.map((o) => ({
        ...o,
        foodItems: (o.foodItems as Array<{ category: string }>).filter(
          (item) => item.category === 'food' || item.category === 'dessert'
        ),
      })).filter((o) => o.foodItems.length > 0);
    }

    case 'payments':
      return await Orders.find({
        status: 'served',
        payment: 'wantToPay',
      }).lean();

    case 'waiter':
    default:
      return await Orders.find({
        status: { $in: ['ordered', 'preparing', 'ready'] },
      }).lean();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = (searchParams.get('channel') ?? 'waiter') as Channel;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (payload: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      // Initial push
      try {
        send(await fetchChannelData(channel));
      } catch (err) {
        console.error('[SSE] initial fetch error', err);
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
        return;
      }

      const interval = setInterval(async () => {
        if (closed || request.signal.aborted) {
          clearInterval(interval);
          if (!closed) {
            closed = true;
            try { controller.close(); } catch { /* ignore */ }
          }
          return;
        }
        try {
          send(await fetchChannelData(channel));
        } catch {
          clearInterval(interval);
          if (!closed) {
            closed = true;
            try { controller.close(); } catch { /* ignore */ }
          }
        }
      }, 1500);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        if (!closed) {
          closed = true;
          try { controller.close(); } catch { /* ignore */ }
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
