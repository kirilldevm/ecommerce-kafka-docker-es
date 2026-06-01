import { SectionPlaceholder } from '@/components/common/SectionPlaceholder';
import { useAuth } from '@/context/auth.context';

export function OrdersPlaceholderPage() {
  const { isAdmin } = useAuth();

  return (
    <SectionPlaceholder
      title="Orders"
      description={
        isAdmin
          ? 'Admin orders dashboard: all orders, live SSE updates, status badges.'
          : 'Your orders list with real-time status updates from the order service.'
      }
    />
  );
}
