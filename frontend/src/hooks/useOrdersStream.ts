import { ensureValidSession } from '@/lib/auth-session';
import { OrderStreamError, connectOrderStream } from '@/lib/order-stream';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useOrdersStore } from '@/stores/orders/orders.store';
import { useEffect } from 'react';

const RECONNECT_DELAY_MS = 3000;

export function useOrdersStream(): void {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const upsertOrder = useOrdersStore((state) => state.upsertOrder);
  const setStreamConnected = useOrdersStore((state) => state.setStreamConnected);

  useEffect(() => {
    if (!user || !refreshToken || !accessToken) {
      return;
    }

    const controller = new AbortController();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const scheduleReconnect = () => {
      if (disposed || controller.signal.aborted) {
        return;
      }

      setStreamConnected(false);
      reconnectTimer = setTimeout(() => {
        void runStream();
      }, RECONNECT_DELAY_MS);
    };

    const runStream = async () => {
      const sessionValid = await ensureValidSession();
      if (!sessionValid || disposed || controller.signal.aborted) {
        setStreamConnected(false);
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (!token) {
        setStreamConnected(false);
        return;
      }

      try {
        await connectOrderStream(
          token,
          (event) => {
            if (event.type === 'connected') {
              setStreamConnected(true);
              return;
            }

            if (!event.order) {
              return;
            }

            if (!isAdmin() && event.order.userId !== user.id) {
              return;
            }

            if (
              event.type === 'order.created' ||
              event.type === 'order.status.updated'
            ) {
              upsertOrder(event.order);
            }
          },
          controller.signal,
        );

        if (!disposed && !controller.signal.aborted) {
          scheduleReconnect();
        }
      } catch (error) {
        if (controller.signal.aborted || disposed) {
          return;
        }

        if (error instanceof OrderStreamError && error.status === 401) {
          const refreshed = await ensureValidSession();
          if (refreshed && !disposed) {
            void runStream();
            return;
          }
        }

        scheduleReconnect();
      }
    };

    void runStream();

    return () => {
      disposed = true;
      controller.abort();
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      setStreamConnected(false);
    };
  }, [
    accessToken,
    isAdmin,
    refreshToken,
    setStreamConnected,
    upsertOrder,
    user,
  ]);
}
