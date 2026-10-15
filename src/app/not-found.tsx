import Link from 'next/link';
import { Compass, ArrowLeft, AlertCircle } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-3xl shadow-lg border border-border">
        <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
            Error 404
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Página o recurso no encontrado
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La página que estás buscando no existe o fue movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition"
          >
            <Compass className="w-4 h-4" />
            Ver Tours
          </Link>
        </div>
      </div>
    </div>
  );
}
