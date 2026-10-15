'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error global de aplicación no controlado:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Ocurrió un problema inesperado</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              La página experimentó una dificultad al cargar. Puedes intentar recargar la vista o volver a la página de inicio.
            </p>
            {error.digest && (
              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Ref: {error.digest}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Ir al Inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
