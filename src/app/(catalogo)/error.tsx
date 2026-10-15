'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';

export default function CatalogoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en catálogo / reserva:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-3xl shadow-lg border border-border">
        <div className="w-16 h-16 mx-auto bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            No se pudo completar la operación
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ocurrió una interrupción al cargar los datos o procesar la reserva. Puedes intentar recargar la página o explorar otros destinos.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-muted-foreground/70">Ref: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition"
          >
            <Compass className="w-4 h-4" />
            Explorar Tours
          </Link>
        </div>
      </div>
    </div>
  );
}
