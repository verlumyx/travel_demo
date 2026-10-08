import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage, hasPermission } from '@/modules/shared/auth/require-permission';
import { createPaymentContainer } from '@/modules/payment/container';
import { paymentRoutes } from '@/modules/payment/routes';
import { bookingRoutes } from '@/modules/booking/routes';
import { customerRoutes } from '@/modules/customer/routes';
import { toPaymentDto } from '@/modules/payment/serializers/payment.serializer';
import { PaymentStatusBadge } from '@/modules/payment/ui/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/modules/payment/ui/PaymentMethodBadge';
import { PaymentVerifyActions } from '@/modules/payment/ui/PaymentVerifyActions';
import { BookingStatusBadge } from '@/modules/booking/ui/BookingStatusBadge';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  User,
  Users,
  FileText,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailPage({ params }: PageProps) {
  await guardPage('payments.show');
  const [canVerifyPayment] = await Promise.all([
    hasPermission('payments.update-status'),
  ]);
  const { id } = await params;

  const paymentContainer = createPaymentContainer();

  let details;
  try {
    details = await paymentContainer.findService.findOrFailWithDetails(id);
  } catch {
    notFound();
  }

  const { payment: rawPayment, booking, customer, departure, tour, verifiedBy } = details;
  const payment = toPaymentDto(rawPayment);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={paymentRoutes.list()}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {payment.code}
              </h1>
              <PaymentStatusBadge status={payment.status} />
              <PaymentMethodBadge method={payment.method} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registrado el {new Date(payment.createdAt).toLocaleDateString('es-VE')} para reserva{' '}
              <span className="font-mono font-medium">{booking.code}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {canVerifyPayment ? (
            <PaymentVerifyActions paymentId={payment.id} status={payment.status} />
          ) : (
            <span className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
              Solo lectura (Conciliación reservada para Operador y Admin)
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Payment Transaction Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Información Financiera de la Transacción
              </h2>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                ID: {payment.id.slice(0, 8)}...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-muted-foreground block text-[11px]">Monto Abonado</span>
                <span className="text-2xl font-bold font-mono text-foreground">
                  ${payment.amount} {payment.currency}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-muted-foreground block text-[11px]">Método de Pago</span>
                <div className="pt-1">
                  <PaymentMethodBadge method={payment.method} />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block">Número de Referencia / Transacción:</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {payment.reference || 'Sin referencia registrada'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block">Fecha Efectiva de Pago:</span>
                <span className="font-medium text-foreground">
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleString('es-VE')
                    : 'No especificada'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block">Atendido / Recibido por:</span>
                <span className="font-medium text-foreground">
                  {payment.receivedByName || 'No especificado'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block">Estado de Auditoría:</span>
                <div className="mt-1">
                  <PaymentStatusBadge status={payment.status} />
                </div>
              </div>
            </div>

            {payment.notes && (
              <div className="pt-3 border-t border-border">
                <span className="text-muted-foreground text-xs block mb-1">Notas y Observaciones:</span>
                <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg border border-border">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Proof / Voucher Image */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Comprobante de Transferencia / Voucher
              </span>
              {payment.proofImageUrl && (
                <a
                  href={payment.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  Abrir original <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </h3>

            {payment.proofImageUrl ? (
              <div className="border border-border rounded-xl overflow-hidden bg-muted/20 flex flex-col items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.proofImageUrl}
                  alt="Comprobante de pago"
                  className="max-h-96 object-contain rounded-lg shadow-xs"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No se adjuntó comprobante visual para este pago.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Booking & Customer Context & Audit */}
        <div className="space-y-6">
          {/* Booking Context Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                Reserva Vinculada
              </div>
              <Link
                href={bookingRoutes.show(booking.id)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Ver Reserva
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-foreground">{booking.code}</span>
                <BookingStatusBadge
                  status={booking.status as 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled'}
                />
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Tour y Salida:</span>
                <span className="font-medium text-foreground">{tour.name}</span>
                <span className="text-[11px] text-muted-foreground block">
                  Salida: {departure.code} • {new Date(departure.departureDate).toLocaleDateString('es-VE')}
                </span>
              </div>

              <div className="pt-2 border-t border-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reserva ({booking.slotsReserved} cupos):</span>
                  <span className="font-mono font-semibold">${booking.totalAmount} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pagado:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ${booking.paidAmount} USD
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Saldo Pendiente:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    ${Math.max(0, Number(booking.totalAmount) - Number(booking.paidAmount)).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Card */}
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
                Ficha CRM
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-foreground text-sm">{customer.fullName}</span>
                <span className="text-[11px] font-mono text-muted-foreground block">
                  {customer.code} • {customer.documentNumber ? `${customer.documentType?.toUpperCase()}: ${customer.documentNumber}` : 'Sin documento'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Teléfono:</span>
                <span className="font-medium text-foreground">{customer.phone || 'No registrado'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Email:</span>
                <span className="font-medium text-foreground">{customer.email || 'No registrado'}</span>
              </div>
            </div>
          </div>

          {/* Verification & Audit */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              Auditoría y Conciliación
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground block text-[11px]">Fecha de Registro:</span>
                <span className="font-medium text-foreground">
                  {new Date(payment.createdAt).toLocaleString('es-VE')}
                </span>
              </div>

              {verifiedBy ? (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Verificado por:</span>
                  <span className="font-medium text-foreground">{verifiedBy.name}</span>
                  <span className="text-[11px] text-muted-foreground block">{verifiedBy.email}</span>
                  {payment.verifiedAt && (
                    <span className="text-[11px] text-muted-foreground block">
                      el {new Date(payment.verifiedAt).toLocaleString('es-VE')}
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Verificado por:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Pendiente por auditoría
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
