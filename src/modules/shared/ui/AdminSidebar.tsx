'use client';

import * as React from 'react';
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
  WalletCards,
  Users,
  UserCog,
  Shield,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Tag,
  Compass,
  CalendarDays,
  Bus,
  Ticket,
  CreditCard,
  WalletCards,
  Users,
  UserCog,
  Shield,
  LayoutDashboard,
};

export interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  roleName?: string;
  allowedItemIds?: string[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  user,
  allowedItemIds,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
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

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  // Contenido de navegación compartido entre desktop y mobile
  const renderNav = (collapsed: boolean) => (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      <nav className={cn('py-4 space-y-6', collapsed ? 'px-2' : 'px-3')}>
        {/* Dashboard Link */}
        <div>
          <Link
            href="/admin"
            onClick={onCloseMobile}
            title="Dashboard"
            className={cn(
              'flex items-center rounded-xl text-xs font-semibold transition active:scale-[0.98]',
              collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
              pathname === '/admin'
                ? 'bg-teal-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </div>

        {/* Sección Operaciones */}
        <div>
          {!collapsed ? (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Operaciones
            </div>
          ) : (
            <div className="w-8 h-[1px] bg-slate-200 mx-auto mb-2" />
          )}

          <div className="space-y-1">
            {mainItems.map((item) => {
              const Icon = ICON_MAP[item.icon] || Compass;
              const isActive = pathname.startsWith(item.url);

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={cn(
                    'flex items-center rounded-xl text-xs font-semibold transition active:scale-[0.98]',
                    collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2',
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && isActive && <ChevronRight className="h-3 w-3 text-white/70" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sección Configuración */}
        {configItems.length > 0 && (
          <div>
            {!collapsed ? (
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Configuración
              </div>
            ) : (
              <div className="w-8 h-[1px] bg-slate-200 mx-auto mb-2" />
            )}

            <div className="space-y-1">
              {configItems.map((item) => {
                const Icon = ICON_MAP[item.icon] || Shield;
                const isActive = pathname.startsWith(item.url);

                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={onCloseMobile}
                    title={item.label}
                    className={cn(
                      'flex items-center rounded-xl text-xs font-semibold transition active:scale-[0.98]',
                      collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2',
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && isActive && <ChevronRight className="h-3 w-3 text-white/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer del Sidebar */}
      <div>
        {/* Enlace al catálogo público */}
        <div className={cn('py-2 border-t border-slate-100', collapsed ? 'px-2' : 'px-3')}>
          <Link
            href="/"
            target="_blank"
            title="Ver Catálogo Público"
            className={cn(
              'flex items-center rounded-xl text-[11px] font-semibold text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition',
              collapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            )}
          >
            <span className="flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              {!collapsed && <span>Ver Catálogo Público</span>}
            </span>
            {!collapsed && <ExternalLink className="h-3 w-3 text-slate-400" />}
          </Link>
        </div>

        {/* Perfil de Usuario y Logout */}
        <div className={cn('p-3 border-t border-slate-200/80 bg-slate-50/70', collapsed && 'p-2')}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${user?.name || 'Usuario'} (${user?.email || 'admin@traveldemo.com'})`}
                className="relative h-8 w-8 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0 cursor-default"
              >
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Cerrar sesión"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative h-8 w-8 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0">
                  {initials}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight">
                    {user?.email || 'admin@traveldemo.com'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                title="Cerrar sesión"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Sidebar Drawer + Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-800 border-r border-slate-200 shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-in-out print:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <Link href="/admin" onClick={onCloseMobile} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                TravelDemo
              </span>
              <span className="text-[10px] text-teal-600 font-bold tracking-wider uppercase block">
                Operaciones
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {renderNav(false)}
      </aside>

      {/* 2. Desktop Sticky Sidebar (Desplegable / Plegable) */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 bg-white text-slate-800 border-r border-slate-200/90 shrink-0 z-30 select-none transition-all duration-300 ease-in-out shadow-xs print:hidden',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand header */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-slate-200/80',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
          )}
        >
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-500 transition shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight truncate">
                  TravelDemo
                </span>
                <span className="text-[10px] text-teal-600 font-bold tracking-wider uppercase block">
                  Operaciones
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Plegar barra lateral"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {renderNav(isCollapsed)}

        {/* Toggle button en la esquina inferior cuando está colapsado */}
        {isCollapsed && onToggleCollapse && (
          <div className="p-2 border-t border-slate-200 flex justify-center bg-slate-50/50">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Desplegar barra lateral"
              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
