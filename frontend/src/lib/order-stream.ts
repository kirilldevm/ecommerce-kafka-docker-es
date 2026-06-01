import { apiConfig } from '@/config/api.config';
import { endpoints } from '@/config/endpoints.config';
import type { OrderStreamEvent } from '@/types/order.types';

function parseSseBlock(block: string): OrderStreamEvent | null {
  const trimmed = block.trim();
  if (!trimmed) {
    return null;
  }

  for (const line of trimmed.split('\n')) {
    if (!line.startsWith('data: ')) {
      continue;
    }

    try {
      return JSON.parse(line.slice(6)) as OrderStreamEvent;
    } catch {
      return null;
    }
  }

  return null;
}

export async function connectOrderStream(
  accessToken: string,
  onEvent: (event: OrderStreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(`${apiConfig.baseUrl}${endpoints.orders.stream}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'text/event-stream',
    },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to connect to order stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const event = parseSseBlock(block);
      if (event) {
        onEvent(event);
      }
    }
  }
}
