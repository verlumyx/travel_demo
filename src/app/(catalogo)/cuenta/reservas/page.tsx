import Link from 'next/link';
import { requireCustomerSession } from '@/modules/customer/auth/customer-session';
import { createBookingContainer } from '@/modules/booking/container';
import { SearchBookingCommand } from '@/modules/booking/commands/search-booking.command';
import { toBookingDto } from '@/modules/booking/serializers/booking.serializer';
import { BookingStatusBadge } from '@/modules/booking/ui/BookingStatusBadge';
import {
  Ticket,
  CalendarDays,
  Compass,
  ArrowRight,
  Clock,
  DollarSign,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

export const instant = false;

export default async function CustomerBookingsPage() {
  const session = await requireCustomerSession();
  const customer = session.customer;

  const bookingContainer = createBookingContainer();
  const searchResult = await bookingContainer.repository.search(
    SearchBookingCommand.fromInput({
      customerId: customer.id,
      limit: 100,
    }),
  );

  const bookings = searchResult.data.map(toBookingDto);
  const now = new Date();

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.departureDate || '') >= now,
  );
  const pastOrCancelledBookings = bookings.filter(
    (b) => b.status === 'cancelled' || new Date(b.departureDate || '') < now,
  );

  const totalPendingBalance = upcomingBookings.reduce(
    (sum, b) => sum + Number(b.pendingBalance),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase block">
            Área Personal de Viajero
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Hola, {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Código de viajero: <span className="font-mono font-semibold text-foreground">{customer.code}</span> • {customer.email}
          </p>
        </div>

        {totalPendingBalance > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 sm:max-w-xs">
            <span className="text-muted-foreground block text-[11px]">Saldo Pendiente Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                ${totalPendingBalance.toFixed(2)}
              </span>
              <span className="text-[11px] text-muted-foreground">USD por liquidar</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Puedes reportar abonos parciales antes de la fecha de salida de cada viaje.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Trips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Próximos Viajes Programados ({upcomingBookings.length})
          </h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
            <Ticket className="h-8 w-8 text-muted-foreground/60 mx-auto" />
            <p>No tienes viajes activos programados en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-card border border-border hover:border-primary/40 rounded-2xl p-6 shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary block">
                        {b.code}
                      </span>
                      <h3 className="text-base font-bold text-foreground leading-snug mt-0.5">
                        {b.tourName}
                      </h3>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1.5 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {b.departureDate
                          ? new Date(b.departureDate).toLocaleDateString('es-VE', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Fecha por definir'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span>Cupos reservados:</span>
                      <span className="font-semibold text-foreground">{b.slotsReserved} pasajero(s)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Total del viaje:</span>
                      <span className="font-mono font-semibold text-foreground">${b.totalAmount} USD</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Abonado / Verificado:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ${b.paidAmount} USD
                      </span>
                    </div>

                    {Number(b.pendingBalance) > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-amber-600 dark:text-amber-400 font-bold">
                        <span>Saldo pendiente:</span>
                        <span className="font-mono">${b.pendingBalance} USD</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/cuenta/reservas/${b.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Ver Voucher y Boleto <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {Number(b.pendingBalance) > 0 && (
                    <Link
                      href={`/cuenta/reservas/${b.id}#reportar-pago`}
                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition"
                    >
                      Abonar saldo
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past or Cancelled Trips */}
      {pastOrCancelledBookings.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-base font-bold text-muted-foreground flex items-center gap-2">
            <Compass className="h-5 w-5 text-muted-foreground" />
            Historial de Viajes Pasados o Cancelados ({pastOrCancelledBookings.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastOrCancelledBookings.map((b) => (
              <div
                key={b.id}
                className="bg-card/60 border border-border rounded-xl p-5 shadow-xs space-y-3 opacity-80 hover:opacity-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground block">{b.code}</span>
                    <h4 className="font-semibold text-foreground text-sm">{b.tourName}</h4>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>
                    {b.departureDate
                      ? new Date(b.departureDate).toLocaleDateString('es-VE')
                      : 'Fecha no registrada'}
                  </span>
                  <Link
                    href={`/cuenta/reservas/${b.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
