'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { customerLogoutAction } from '@/app/(catalogo)/cuenta/actions';
import { Ticket, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerNavProps {
  customerName: string;
  customerCode: string;
}

export function CustomerNav({ customerName, customerCode }: CustomerNavProps) {
  const pathname = usePathname();
  const isReservas = pathname?.startsWith('/cuenta/reservas');
  const isPerfil = pathname?.startsWith('/cuenta/perfil');

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Navigation tabs without duplicated logo */}
        <nav className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/cuenta/reservas"
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition font-semibold',
              isReservas
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Ticket className="h-3.5 w-3.5" />
            Mis Reservas
          </Link>
          <Link
            href="/cuenta/perfil"
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition font-semibold',
              isPerfil
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <User className="h-3.5 w-3.5" />
            Mi Perfil
          </Link>
        </nav>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/cuenta/perfil"
            className="text-right hidden sm:block hover:opacity-80 transition"
            title="Editar mi perfil"
          >
            <span className="text-xs font-semibold text-foreground block">
              {customerName}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground block">
              {customerCode}
            </span>
          </Link>

          <form action={customerLogoutAction}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted active:scale-[0.98] text-muted-foreground hover:text-foreground transition cursor-pointer text-xs flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
