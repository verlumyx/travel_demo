'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { FlashToaster } from '@/modules/shared/flash/FlashToaster';
import type { FlashMessage } from '@/modules/shared/flash/flash';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface AdminShellProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  roleName?: string;
  allowedItemIds?: string[];
  flash?: FlashMessage | null;
  children: React.ReactNode;
}

export function AdminShell({
  user,
  roleName,
  allowedItemIds,
  flash,
  children,
}: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Recuperar preferencia de sidebar colapsado
  React.useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Cerrar drawer móvil al cambiar de ruta
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Sidebar (Desktop colapsable y Mobile desplegable) */}
      <AdminSidebar
        user={user}
        roleName={roleName}
        allowedItemIds={allowedItemIds}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Botón toggle para Desktop */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title={isCollapsed ? 'Desplegar barra lateral' : 'Plegar barra lateral'}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            {/* Botón menú para Mobile */}
            <button
              type="button"
              onClick={toggleMobile}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Base de Datos Conectada</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              Rol: {roleName || 'Operador'}
            </span>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            >
              <span>Ver Web</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </header>

        <FlashToaster flash={flash ?? null} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
