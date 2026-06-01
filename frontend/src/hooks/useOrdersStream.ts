import { useAuthStore } from '@/stores/auth/auth.store';
import { useOrdersStore } from '@/stores/orders/orders.store';
import { connectOrderStream } from '@/lib/order-stream';
import { useEffect } from 'react';

export function useOrdersStream(): void {
  const user = useAuthStore((state) => state.user);
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const upsertOrder = useOrdersStore((state) => state.upsertOrder);
  const setStreamConnected = useOrdersStore((state) => state.setStreamConnected);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!user || !accessToken) {
      return;
    }

    const controller = new AbortController();

    void connectOrderStream(
      accessToken,
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

        if (event.type === 'order.created' || event.type === 'order.status.updated') {
          upsertOrder(event.order);
        }
      },
      controller.signal,
    ).catch(() => {
      setStreamConnected(false);
    });

    return () => {
      controller.abort();
      setStreamConnected(false);
    };
  }, [getAccessToken, isAdmin, setStreamConnected, upsertOrder, user]);
}
