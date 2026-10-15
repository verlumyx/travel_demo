import Link from 'next/link';
import { CalendarX, Compass, ArrowLeft } from 'lucide-react';

export default function CatalogoNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-3xl shadow-lg border border-border">
        <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
          <CalendarX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Salida No Encontrada
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Fecha o tour no disponible
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La salida programada que intentas consultar no existe, expiró o ya no cuenta con cupos abiertos en el catálogo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/tours"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shadow-xs"
          >
            <Compass className="w-4 h-4" />
            Explorar Próximos Tours
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
