import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createBookingContainer } from '@/modules/booking/container';
import { bookingRoutes } from '@/modules/booking/routes';
import { customerRoutes } from '@/modules/customer/routes';
import { departureRoutes } from '@/modules/departure/routes';
import { paymentRoutes } from '@/modules/payment/routes';
import { toBookingDto } from '@/modules/booking/serializers/booking.serializer';
import { toCustomerDto } from '@/modules/customer/serializers/customer.serializer';
import { toDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import { BookingStatusBadge } from '@/modules/booking/ui/BookingStatusBadge';
import { BookingStatusSelect } from '@/modules/booking/ui/BookingStatusSelect';
import { RichTextView, isEmptyHtml, stripHtml } from '@/components/ui/rich-text-view';
import {
  Ticket,
  ArrowLeft,
  Edit3,
  Users,
  CalendarDays,
  DollarSign,
  Plus,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  await guardPage('bookings.show');
  const { id } = await params;

  const bookingContainer = createBookingContainer();

  let details;
  try {
    details = await bookingContainer.findService.findOrFailWithDetails(id);
  } catch {
    notFound();
  }

  const { booking: rawBooking, customer: rawCustomer, departure: rawDeparture, tour, passengers, payments } = details;

  const booking = toBookingDto({
    ...rawBooking,
    customerName: `${rawCustomer.firstName} ${rawCustomer.lastName}`.trim(),
    customerCode: rawCustomer.code,
    departureDate: rawDeparture.departureDate,
    departureCode: rawDeparture.code,
    tourName: tour.name,
    tourCode: tour.code,
  });

  const customer = toCustomerDto(rawCustomer);
  const departure = toDepartureDto({ ...rawDeparture, tourName: tour.name, tourCode: tour.code });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={bookingRoutes.list()}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {booking.code}
              </h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Emitida el {new Date(booking.createdAt).toLocaleDateString('es-VE')} para {customer.fullName} ({customer.code})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <BookingStatusSelect id={booking.id} currentStatus={booking.status} />
          <Link
            href={bookingRoutes.edit(booking.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-input bg-background hover:bg-muted text-foreground text-xs font-medium transition shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editar Notas
          </Link>
        </div>
      </div>

      {/* Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Users className="h-4 w-4" />
              Cliente Titular
            </div>
            <Link
              href={customerRoutes.show(customer.id)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Ver Ficha
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-foreground text-sm">{customer.fullName}</span>
              <span className="text-muted-foreground block text-[11px] font-mono">
                {customer.code} • {customer.documentNumber ? `${customer.documentType?.toUpperCase()}: ${customer.documentNumber}` : 'Sin documento'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Teléfono / WhatsApp:</span>
              <span className="font-medium text-foreground">{customer.phone || 'No registrado'}</span>
            </div>

            <div>
              <span className="text-muted-foreground block">Email:</span>
              <span className="font-medium text-foreground">{customer.email || 'No registrado'}</span>
            </div>
          </div>
        </div>

        {/* Departure & Tour Info */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <CalendarDays className="h-4 w-4" />
              Salida Programada
            </div>
            <Link
              href={departureRoutes.show(departure.id)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Ver Salida
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-foreground text-sm">{tour.name}</span>
              <span className="text-muted-foreground block text-[11px] font-mono">
                {tour.code} • Salida: {departure.code}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Fecha de Salida:</span>
              <span className="font-medium text-foreground">
                {new Date(departure.departureDate).toLocaleDateString('es-VE', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                a las{' '}
                {new Date(departure.departureDate).toLocaleTimeString('es-VE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Punto de Encuentro:</span>
              <span className="font-medium text-foreground">{departure.meetingPoint || 'No especificado'}</span>
            </div>
          </div>
        </div>

        {/* Financial Balance Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <DollarSign className="h-4 w-4" />
              Conciliación Financiera
            </div>
            <Link
              href={`/admin/payments/create?bookingId=${booking.id}`}
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <Plus className="h-3 w-3" />
              Abonar Pago
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monto Total ({booking.slotsReserved} cupos):</span>
              <span className="font-bold text-foreground text-sm">${booking.totalAmount} USD</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Pagado / Verificado:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                ${booking.paidAmount} USD
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-muted-foreground font-medium">Saldo Restante:</span>
              <span className={`font-bold text-sm ${Number(booking.pendingBalance) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                ${booking.pendingBalance} USD
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${booking.paymentProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground block text-right">
              {booking.paymentProgressPercent}% liquidado
            </span>
          </div>
        </div>
      </div>

      {/* Booking Notes / Special Requirements */}
      {!isEmptyHtml(booking.notes) && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4" /> Notas y Observaciones de la Reserva
            </span>
            <Link
              href={bookingRoutes.edit(booking.id)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Editar
            </Link>
          </div>
          <RichTextView
            content={booking.notes}
            className="text-xs text-foreground leading-relaxed"
          />
        </div>
      )}

      {/* Passengers List */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Pasajeros Registrados ({passengers.length} de {booking.slotsReserved} cupos)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Pasajero</th>
                <th className="py-3 px-4 font-semibold">Documento</th>
                <th className="py-3 px-4 font-semibold">Teléfono</th>
                <th className="py-3 px-4 font-semibold">Rol en Viaje</th>
                <th className="py-3 px-4 font-semibold">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {passengers.map((p, idx) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Pasajero #{idx + 1}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-muted-foreground">
                    {p.documentNumber ? (
                      <span className="font-mono bg-muted px-2 py-0.5 rounded">
                        {p.documentType ? `${p.documentType.toUpperCase()}: ` : ''}
                        {p.documentNumber}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-3 px-4 text-muted-foreground">
                    {p.phone || '-'}
                  </td>

                  <td className="py-3 px-4">
                    {p.isMainContact ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Contacto Principal
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Acompañante</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-muted-foreground">
                    {stripHtml(p.notes) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Associated Payments List */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Historial de Pagos y Abonos ({payments.length})
            </h3>
          </div>
          <Link
            href={`/admin/payments/create?bookingId=${booking.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar Abono
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No se han registrado pagos para esta reserva aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Método</th>
                  <th className="py-3 px-4 font-semibold">Referencia</th>
                  <th className="py-3 px-4 font-semibold">Fecha de Pago</th>
                  <th className="py-3 px-4 font-semibold">Monto</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      <Link href={`/admin/payments/${p.id}`} className="hover:underline">
                        {p.code}
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-medium text-foreground capitalize">
                      {p.method.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {p.reference || '-'}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString('es-VE')}
                    </td>

                    <td className="py-3 px-4 font-bold text-foreground">
                      ${p.amount} {p.currency}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          p.status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : p.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {p.status === 'verified'
                          ? 'Verificado'
                          : p.status === 'rejected'
                            ? 'Rechazado'
                            : 'Pendiente'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/payments/${p.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
