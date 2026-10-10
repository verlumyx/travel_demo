'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createPaymentAction } from '@/app/(admin)/admin/payments/actions';
import { paymentRoutes } from '../routes';
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  User,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface AvailableBooking {
  id: string;
  code: string;
  customerName: string;
  totalAmount: string;
  paidAmount: string;
  pendingBalance: string;
}

interface PaymentFormProps {
  bookings: AvailableBooking[];
  initialBookingId?: string;
}

export function PaymentForm({ bookings, initialBookingId }: PaymentFormProps) {
  const [state, formAction, isPending] = useActionState(createPaymentAction, {
    status: 'idle',
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialBookingId || (bookings[0]?.id ?? ''),
  );

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const [amount, setAmount] = useState<string>(
    selectedBooking ? selectedBooking.pendingBalance : '',
  );

  const handleBookingChange = (id: string) => {
    setSelectedBookingId(id);
    const b = bookings.find((item) => item.id === id);
    if (b) {
      setAmount(b.pendingBalance);
    }
  };

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      {state.message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium ${
            state.status === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Booking Selection & Financial Summary */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          Reserva Asociada
        </div>

        <div className="space-y-2">
          <label htmlFor="bookingId" className="text-xs font-medium text-foreground">
            Seleccione la Reserva a Conciliar *
          </label>
          <Select2
            id="bookingId"
            name="bookingId"
            value={selectedBookingId}
            onValueChange={(val) => handleBookingChange(val)}
            placeholder="Seleccione una reserva..."
            options={bookings.map((b) => ({
              value: b.id,
              label: `${b.code} - ${b.customerName} (Pendiente: $${b.pendingBalance} USD / Total: $${b.totalAmount})`,
            }))}
            size="sm"
            required
          />
          {state.fieldErrors?.bookingId && (
            <p className="text-xs text-destructive">{state.fieldErrors.bookingId[0]}</p>
          )}
        </div>

        {selectedBooking && (
          <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Total de la Reserva:</span>
              <span className="font-semibold text-foreground text-sm font-mono">
                ${selectedBooking.totalAmount} USD
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Ya Abonado / Verificado:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                ${selectedBooking.paidAmount} USD
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Saldo Pendiente:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm font-mono">
                ${selectedBooking.pendingBalance} USD
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
          <DollarSign className="h-4 w-4" />
          Detalles de la Transacción
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="method" className="text-xs font-medium text-foreground">
              Método de Pago *
            </label>
            <Select2
              id="method"
              name="method"
              defaultValue="pago_movil"
              options={[
                { value: 'pago_movil', label: 'Pago Móvil (VES)' },
                { value: 'zelle', label: 'Zelle (USD)' },
                { value: 'binance', label: 'Binance Pay (USDT)' },
                { value: 'zinli', label: 'Zinli (USD)' },
                { value: 'bank_transfer', label: 'Transferencia Bancaria' },
                { value: 'cash_usd', label: 'Efectivo USD (Caja/Oficina)' },
                { value: 'cash_ves', label: 'Efectivo VES (Caja/Oficina)' },
              ]}
              size="sm"
              required
            />
            {state.fieldErrors?.method && (
              <p className="text-xs text-destructive">{state.fieldErrors.method[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-xs font-medium text-foreground">
              Monto Pagado / Abonado *
            </label>
            <CurrencyInput
              id="amount"
              name="amount"
              value={parseFloat(amount) || 0}
              onValueChange={(val) => setAmount(val.toFixed(2))}
              placeholder="0.00"
              min={0.01}
              required
            />
            {selectedBooking && Number(selectedBooking.pendingBalance) > 0 && (
              <button
                type="button"
                onClick={() => setAmount(selectedBooking.pendingBalance)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Pagar saldo total (${selectedBooking.pendingBalance})
              </button>
            )}
            {state.fieldErrors?.amount && (
              <p className="text-xs text-destructive">{state.fieldErrors.amount[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="currency" className="text-xs font-medium text-foreground">
              Moneda
            </label>
            <Select2
              id="currency"
              name="currency"
              defaultValue="USD"
              options={[
                { value: 'USD', label: 'USD (Dólares)' },
                { value: 'VES', label: 'VES (Bolívares)' },
                { value: 'USDT', label: 'USDT (Tether)' },
              ]}
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="paymentDate" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Fecha y Hora del Pago *
            </label>
            <input
              id="paymentDate"
              name="paymentDate"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              required
            />
            {state.fieldErrors?.paymentDate && (
              <p className="text-xs text-destructive">{state.fieldErrors.paymentDate[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="reference" className="text-xs font-medium text-foreground">
              Número de Referencia / ID de Transacción
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              placeholder="Ej: 048291, Ref #9821374"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring font-mono"
            />
            {state.fieldErrors?.reference && (
              <p className="text-xs text-destructive">{state.fieldErrors.reference[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="receivedByName" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Recibido / Atendido por
            </label>
            <input
              id="receivedByName"
              name="receivedByName"
              type="text"
              placeholder="Nombre del asesor o receptor"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="proofImageUrl" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              URL del Comprobante / Captura
            </label>
            <input
              id="proofImageUrl"
              name="proofImageUrl"
              type="url"
              placeholder="https://... o enlace de captura de pantalla"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="notes" className="text-xs font-medium text-foreground">
              Notas y Observaciones
            </label>
            <RichTextEditor
              id="notes"
              name="notes"
              placeholder="Ej: El cliente abonó el 50% de inicial, el resto se liquidará en el abordaje..."
              minHeight="min-h-[130px]"
            />
          </div>
        </div>
      </div>

      {/* Immediate Verification Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-foreground">
              Verificar y Conciliar Inmediatamente
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Active esta opción si el dinero ya fue acreditado en cuenta bancaria o recibido en efectivo en caja.
            El saldo de la reserva se recalculará automáticamente.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="status"
            value="verified"
            defaultChecked
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href={paymentRoutes.list()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando Pago...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Registrar Abono
            </>
          )}
        </button>
      </div>
    </form>
  );
}
