import { NavLink } from 'react-router-dom';
import { getNavItemsForRole } from '@/config/navigation.config';
import { useAuth } from '@/context/auth.context';
import { cn } from '@/lib/utils';

export function AppNav() {
  const { isAdmin } = useAuth();
  const items = getNavItemsForRole(isAdmin);

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
