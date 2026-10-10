'use client';

import Link from 'next/link';
import { customerLogoutAction } from '@/app/(catalogo)/cuenta/actions';
import { Compass, Ticket, LogOut } from 'lucide-react';

interface CustomerNavProps {
  customerName: string;
  customerCode: string;
}

export function CustomerNav({ customerName, customerCode }: CustomerNavProps) {
  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-foreground tracking-tight group">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-xs">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground block leading-tight">TravelDemo</span>
              <span className="text-[10px] text-primary font-semibold tracking-wider uppercase block">Portal Pasajero</span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <Link
              href="/cuenta/reservas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary transition font-semibold"
            >
              <Ticket className="h-3.5 w-3.5" />
              Mis Reservas
            </Link>
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-foreground block">
              {customerName}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground block">
              {customerCode}
            </span>
          </div>

          <form action={customerLogoutAction}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-2 rounded-lg border border-border bg-background hover:bg-muted active:scale-[0.98] text-muted-foreground hover:text-foreground transition cursor-pointer text-xs flex items-center gap-1.5"
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
