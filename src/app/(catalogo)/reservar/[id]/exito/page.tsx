import Link from 'next/link';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    bookingCode?: string;
    bookingId?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { bookingCode, bookingId } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 text-center space-y-8">
      {/* Success Badge & Illustration */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          ¡Reserva y Pago Recibidos!
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          ¡Tus cupos han sido bloqueados con éxito!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Tu reserva ya se encuentra en nuestro sistema. El equipo de operaciones conciliará tu comprobante bancario en breve.
        </p>
      </div>

      {/* Code Receipt Box */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs max-w-md mx-auto space-y-3">
        <span className="text-[11px] uppercase font-bold text-muted-foreground block">
          Código Oficial de Reserva
        </span>
        <span className="text-3xl font-black font-mono text-primary block tracking-wider">
          {bookingCode || 'RES-PROCESADA'}
        </span>
        <p className="text-xs text-muted-foreground">
          Guarda este código para cualquier consulta con tu asesor o guía de viaje.
        </p>
      </div>

      {/* Next Steps Guidance */}
      <div className="p-6 rounded-3xl bg-muted/40 border border-border text-left text-xs space-y-3 max-w-lg mx-auto">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          ¿Qué ocurre a continuación?
        </h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>Validación de la transferencia o pago móvil en nuestras cuentas bancarias.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>Actualización del saldo y emisión de tu boleto con código QR para el abordaje.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>Acceso directo a tus viajes desde el Portal del Pasajero en cualquier momento.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href="/cuenta/reservas"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 active:scale-[0.98] transition shadow-xs cursor-pointer"
        >
          <Ticket className="h-4 w-4" />
          Ir a Mis Reservas y Boletos
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/tours"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-xs transition"
        >
          <Compass className="h-4 w-4" />
          Explorar Más Tours
        </Link>
      </div>
    </div>
  );
}
