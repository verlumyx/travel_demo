import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCustomerSession } from '@/modules/customer/auth/customer-session';
import { createBookingContainer } from '@/modules/booking/container';
import { toBookingDto } from '@/modules/booking/serializers/booking.serializer';
import { BookingStatusBadge } from '@/modules/booking/ui/BookingStatusBadge';
import { PaymentStatusBadge } from '@/modules/payment/ui/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/modules/payment/ui/PaymentMethodBadge';
import { CustomerReportPaymentForm } from '@/modules/customer/ui/CustomerReportPaymentForm';
import { CustomerVoucherPrintButton } from '@/modules/customer/ui/CustomerVoucherPrintButton';
import { RichTextView, isEmptyHtml } from '@/components/ui/rich-text-view';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerBookingDetailPage({ params }: PageProps) {
  const session = await requireCustomerSession();
  const { id } = await params;

  const bookingContainer = createBookingContainer();

  let details;
  try {
    details = await bookingContainer.findService.findOrFailWithDetails(id);
  } catch {
    notFound();
  }

  // Security guard: Ensure booking strictly belongs to the authenticated customer
  if (details.customer.id !== session.customer.id) {
    notFound();
  }

  const {
    booking: rawBooking,
    customer,
    departure,
    tour,
    passengers,
    payments,
  } = details;

  const booking = toBookingDto({
    ...rawBooking,
    customerName: `${customer.firstName} ${customer.lastName}`.trim(),
    customerCode: customer.code,
    departureDate: departure.departureDate,
    departureCode: departure.code,
    tourName: tour.name,
    tourCode: tour.code,
  });

  const depDate = new Date(departure.departureDate);
  const qrValidationPayload = encodeURIComponent(
    `RESERVA:${booking.code}|SALIDA:${departure.code}|TITULAR:${customer.firstName} ${customer.lastName}|PASAJEROS:${passengers.length}`,
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrValidationPayload}`;

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/cuenta/reservas"
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                {booking.code}
              </h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{tour.name}</p>
          </div>
        </div>

        <CustomerVoucherPrintButton />
      </div>

      {/* Official Trip Voucher Sheet */}
      <div className="bg-card border-2 border-border print:border-black rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 print:p-0 print:shadow-none print:space-y-4">
        {/* Voucher Top Brand & QR Code */}
        <div className="border-b-2 border-foreground/15 pb-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase block">
              Boleto Oficial de Viaje & Abordaje
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {tour.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-mono font-bold text-sm bg-muted/60 print:bg-slate-200 px-2.5 py-0.5 rounded-lg text-foreground">
                Reserva: {booking.code}
              </span>
              <span className="font-mono text-xs text-muted-foreground print:text-black">
                Salida: {departure.code}
              </span>
              <span className="text-xs text-muted-foreground print:text-black">
                • {booking.slotsReserved} cupos
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex items-center gap-4 self-center sm:self-auto bg-muted/30 print:bg-white p-3 rounded-2xl border border-border print:border-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`QR de Reserva ${booking.code}`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg"
            />
            <div className="text-[10px] text-muted-foreground print:text-black space-y-1 max-w-[100px]">
              <span className="font-bold text-foreground print:text-black block">Check-in Móvil</span>
              <p className="leading-tight">Presenta este QR al guía o coordinador para validar tu cupo.</p>
            </div>
          </div>
        </div>

        {/* Meeting & Schedule Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-muted/30 print:bg-slate-100 p-4 rounded-2xl border border-border print:border-slate-300">
          <div className="space-y-1">
            <span className="text-muted-foreground print:text-black block text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              Fecha del Viaje
            </span>
            <span className="font-bold text-foreground text-sm block">
              {depDate.toLocaleDateString('es-VE', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground print:text-black block text-[10px] uppercase font-bold flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              Hora de Cita y Salida
            </span>
            <span className="font-bold text-foreground text-sm block">
              Salida: {depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {departure.meetingTime && (
              <span className="text-amber-600 dark:text-amber-400 print:text-black block font-semibold text-[11px]">
                Hora de cita previa: {departure.meetingTime}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground print:text-black block text-[10px] uppercase font-bold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              Punto de Encuentro
            </span>
            <span className="font-semibold text-foreground text-sm block">
              {departure.meetingPoint || 'Se notificará previamente por WhatsApp'}
            </span>
          </div>
        </div>

        {/* Registered Passengers Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Nómina de Pasajeros Registrados ({passengers.length})
          </h3>

          <div className="overflow-x-auto rounded-xl border border-border print:border-black">
            <table className="w-full text-left text-xs divide-y divide-border print:divide-black">
              <thead className="bg-muted/50 print:bg-slate-200 text-foreground uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Pasajero</th>
                  <th className="py-2.5 px-4">Documento</th>
                  <th className="py-2.5 px-4">Teléfono</th>
                  <th className="py-2.5 px-4">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black text-[11px]">
                {passengers.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-4 font-mono font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {p.documentNumber ? (
                        <>
                          {p.documentType ? `${p.documentType.toUpperCase()}: ` : ''}
                          {p.documentNumber}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-4">{p.phone || '-'}</td>
                    <td className="py-2.5 px-4">
                      {p.isMainContact ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 print:text-black">
                          <CheckCircle2 className="h-3 w-3" />
                          Contacto Principal
                        </span>
                      ) : (
                        <span className="text-muted-foreground print:text-black">Acompañante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Notes / Special Requirements */}
        {!isEmptyHtml(booking.notes) && (
          <div className="bg-muted/30 print:bg-slate-50 border border-border print:border-slate-300 rounded-2xl p-4 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground print:text-black block">
              Notas y Requerimientos Especiales
            </span>
            <RichTextView
              content={booking.notes}
              className="text-foreground print:text-black leading-relaxed"
            />
          </div>
        )}

        {/* Financial Status Summary */}
        <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground print:text-black block text-[11px]">
              Titular de la Reserva: <strong className="text-foreground">{customer.firstName} {customer.lastName}</strong> ({customer.code})
            </span>
            <span className="text-muted-foreground print:text-black block text-[11px]">
              Contacto de Emergencia: {customer.emergencyContact || 'No especificado'} {customer.emergencyPhone ? `(${customer.emergencyPhone})` : ''}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 print:bg-slate-100 border border-border print:border-black flex items-center gap-6 text-xs">
            <div>
              <span className="text-muted-foreground print:text-black block text-[10px]">Total:</span>
              <span className="font-mono font-bold text-sm">${booking.totalAmount} USD</span>
            </div>
            <div>
              <span className="text-muted-foreground print:text-black block text-[10px]">Abonado:</span>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 print:text-black">
                ${booking.paidAmount} USD
              </span>
            </div>
            <div>
              <span className="text-muted-foreground print:text-black block text-[10px]">Saldo Pendiente:</span>
              <span className={`font-mono font-bold text-sm ${Number(booking.pendingBalance) > 0 ? 'text-amber-600 dark:text-amber-400 print:text-black' : 'text-muted-foreground'}`}>
                ${booking.pendingBalance} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Reporting & Deposit Form (Hidden on Print) */}
      {Number(booking.pendingBalance) > 0 && booking.status !== 'cancelled' && (
        <div id="reportar-pago" className="print:hidden">
          <CustomerReportPaymentForm
            bookingId={booking.id}
            bookingCode={booking.code}
            pendingBalance={booking.pendingBalance}
          />
        </div>
      )}

      {/* Payment Receipts History (Hidden on Print) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 print:hidden">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Historial de Abonos y Pagos Reportados ({payments.length})
        </h3>

        {payments.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No has reportado pagos adicionales para esta reserva aún.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3">Referencia</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Monto</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{p.code}</td>
                    <td className="py-2.5 px-3">
                      <PaymentMethodBadge method={p.method} />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">{p.reference || '-'}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString('es-VE')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                      ${p.amount} {p.currency}
                    </td>
                    <td className="py-2.5 px-3">
                      <PaymentStatusBadge status={p.status} />
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
