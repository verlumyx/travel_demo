'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_REGISTRY } from '@/modules/shared/menu/menu-registry';
import { signOut } from '@/lib/auth-client';
import {
  MapPin,
  Tag,
  Compass,
  CalendarDays,
  Bus,
  Ticket,
  CreditCard,
  Users,
  UserCog,
  Shield,
  LayoutDashboard,
  LogOut,
  Plane,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Tag,
  Compass,
  CalendarDays,
  Bus,
  Ticket,
  CreditCard,
  Users,
  UserCog,
  Shield,
  LayoutDashboard,
};

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  roleName?: string;
  allowedItemIds?: string[];
}

export function AdminSidebar({ user, roleName, allowedItemIds }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const mainItems = MENU_REGISTRY.filter(
    (item) => item.section === 'main' && (!allowedItemIds || allowedItemIds.includes(item.id))
  ).sort((a, b) => a.order - b.order);

  const configItems = MENU_REGISTRY.filter(
    (item) => item.section === 'config' && (!allowedItemIds || allowedItemIds.includes(item.id))
  ).sort((a, b) => a.order - b.order);


  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white block">TravelDemo</span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Panel Operativo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Operaciones
          </div>
          <div className="space-y-1">
            {mainItems.map((item) => {
              const Icon = ICON_MAP[item.icon] || Compass;
              const isActive = pathname.startsWith(item.url);

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {configItems.length > 0 && (
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Configuración
            </div>
            <div className="space-y-1">
              {configItems.map((item) => {
                const Icon = ICON_MAP[item.icon] || Shield;
                const isActive = pathname.startsWith(item.url);

                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</p>
              {roleName && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  roleName === 'Admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : roleName === 'Operador'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {roleName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@traveldemo.com'}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
