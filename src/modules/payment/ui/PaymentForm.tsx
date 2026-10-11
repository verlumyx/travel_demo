'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createPaymentAction } from '@/app/(admin)/admin/payments/actions';
import { paymentRoutes } from '../routes';
import type { PaymentMethodDto } from '@/modules/payment-method/serializers/payment-method.serializer';
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  User,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Info,
} from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';

export interface AvailableBooking {
  id: string;
  code: string;
  customerName: string;
  totalAmount: string;
  paidAmount: string;
  pendingVerificationAmount?: string;
  pendingBalance: string;
  isFullyCovered?: boolean;
}

interface PaymentFormProps {
  bookings: AvailableBooking[];
  initialBookingId?: string;
  paymentMethods?: PaymentMethodDto[];
}

const FALLBACK_METHODS = [
  { value: 'Pago Móvil (VES)', label: 'Pago Móvil (VES)', currency: 'VES' },
  { value: 'Zelle (USD)', label: 'Zelle (USD)', currency: 'USD' },
  { value: 'Binance Pay (USDT)', label: 'Binance Pay (USDT)', currency: 'USDT' },
  { value: 'Zinli (USD)', label: 'Zinli (USD)', currency: 'USD' },
  { value: 'Transferencia Bancaria', label: 'Transferencia Bancaria', currency: 'VES' },
  { value: 'Efectivo USD (Caja/Oficina)', label: 'Efectivo USD (Caja/Oficina)', currency: 'USD' },
  { value: 'Efectivo VES (Caja/Oficina)', label: 'Efectivo VES (Caja/Oficina)', currency: 'VES' },
];

export function PaymentForm({
  bookings,
  initialBookingId,
  paymentMethods,
}: PaymentFormProps) {
  const [state, formAction, isPending] = useActionState(createPaymentAction, {
    status: 'idle',
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialBookingId ?? '',
  );

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const isFullyCovered = Boolean(
    selectedBooking?.isFullyCovered ||
      (selectedBooking && Number(selectedBooking.pendingBalance) <= 0),
  );

  const [amount, setAmount] = useState<string>(
    selectedBooking && !isFullyCovered ? selectedBooking.pendingBalance : '',
  );

  const hasConfiguredMethods = Boolean(paymentMethods && paymentMethods.length > 0);
  const initialMethodName = hasConfiguredMethods
    ? paymentMethods![0].name
    : FALLBACK_METHODS[0].value;

  const [selectedMethodName, setSelectedMethodName] = useState<string>(initialMethodName);
  const currentMethod = paymentMethods?.find((m) => m.name === selectedMethodName);

  const [currency, setCurrency] = useState<string>(
    currentMethod?.currency || (hasConfiguredMethods ? paymentMethods![0].currency : 'USD'),
  );

  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);

  const handleBookingChange = (id: string) => {
    setSelectedBookingId(id);
    const b = bookings.find((item) => item.id === id);
    if (b) {
      if (b.isFullyCovered || Number(b.pendingBalance) <= 0) {
        setAmount('0.00');
      } else {
        setAmount(b.pendingBalance);
      }
    } else {
      setAmount('');
    }
  };

  const handleMethodChange = (val: string) => {
    setSelectedMethodName(val);
    const found = paymentMethods?.find((m) => m.name === val);
    if (found) {
      setCurrency(found.currency);
    } else {
      const fallback = FALLBACK_METHODS.find((f) => f.value === val);
      if (fallback) setCurrency(fallback.currency);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const maxAllowed = selectedBooking ? parseFloat(selectedBooking.pendingBalance) || 0 : Infinity;
  const isOverpaid = selectedBooking && !isFullyCovered && numAmount > maxAllowed + 0.001;

  const isSubmitDisabled =
    isPending ||
    isUploadingProof ||
    !selectedBooking ||
    isFullyCovered ||
    numAmount <= 0 ||
    isOverpaid;

  // Options for payment methods
  const methodOptions = hasConfiguredMethods
    ? paymentMethods!.map((m) => ({
        value: m.name,
        label: `${m.name} (${m.currency})`,
      }))
    : FALLBACK_METHODS.map((f) => ({
        value: f.value,
        label: f.label,
      }));

  return (
    <form action={formAction} autoComplete="off" className="space-y-8 max-w-3xl">
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
              label: b.isFullyCovered
                ? `${b.code} - ${b.customerName} [PAGADA TOTALMENTE / $0.00 PENDIENTE]`
                : `${b.code} - ${b.customerName} (Por cobrar: $${b.pendingBalance} USD / Total: $${b.totalAmount})`,
            }))}
            size="sm"
            required
          />
          {state.fieldErrors?.bookingId && (
            <p className="text-xs text-destructive">{state.fieldErrors.bookingId[0]}</p>
          )}
        </div>

        {selectedBooking && (
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Total de Reserva:</span>
                <span className="font-semibold text-foreground text-sm font-mono">
                  ${selectedBooking.totalAmount} USD
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Abonado / Aprobado:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                  ${selectedBooking.paidAmount} USD
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">En Verificación:</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400 text-sm font-mono">
                  ${selectedBooking.pendingVerificationAmount || '0.00'} USD
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Saldo por Pagar:</span>
                <span
                  className={`font-bold text-sm font-mono ${
                    isFullyCovered
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  ${selectedBooking.pendingBalance} USD
                </span>
              </div>
            </div>

            {isFullyCovered ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Reserva sin saldo pendiente</p>
                  <p className="text-[11px] leading-relaxed">
                    Esta reserva ya tiene el 100% de su monto cubierto (${selectedBooking.totalAmount} USD)
                    entre pagos aprobados y pagos pendientes por validar. No es posible registrar pagos
                    adicionales.
                  </p>
                </div>
              </div>
            ) : null}
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
              value={selectedMethodName}
              onValueChange={handleMethodChange}
              options={methodOptions}
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
              disabled={isFullyCovered}
              required
            />
            {selectedBooking && !isFullyCovered && Number(selectedBooking.pendingBalance) > 0 && (
              <button
                type="button"
                onClick={() => setAmount(selectedBooking.pendingBalance)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Pagar saldo pendiente exacto (${selectedBooking.pendingBalance} USD)
              </button>
            )}
            {isOverpaid && (
              <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                El monto no puede superar el saldo disponible (${selectedBooking?.pendingBalance} USD).
              </p>
            )}
            {state.fieldErrors?.amount && (
              <p className="text-xs text-destructive">{state.fieldErrors.amount[0]}</p>
            )}
          </div>

          {/* Coordinates and Bank Details of Configured Method */}
          {currentMethod?.instructions ? (
            <div className="sm:col-span-2 p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-primary" />
                Coordenadas e Instrucciones ({currentMethod.name}):
              </span>
              <div className="whitespace-pre-line text-muted-foreground font-mono text-[11px] bg-background p-3 rounded-lg border border-border leading-relaxed">
                {currentMethod.instructions}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="currency" className="text-xs font-medium text-foreground">
              Moneda
            </label>
            <input type="hidden" name="currency" value={currency} />
            <Select2
              id="currencySelect"
              value={currency}
              onValueChange={(val) => setCurrency(val)}
              options={[
                { value: 'USD', label: 'USD (Dólares)' },
                { value: 'VES', label: 'VES (Bolívares)' },
                { value: 'USDT', label: 'USDT (Tether)' },
                { value: 'EUR', label: 'EUR (Euros)' },
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

          {/* Proof of Payment Upload */}
          <div className="space-y-2 sm:col-span-2">
            <ImageUpload
              name="proofImageUrl"
              folder="payments"
              label="Comprobante de Pago / Voucher (Captura o Foto)"
              hint="Formatos: JPG, PNG, WebP o AVIF (máx. 2 MB). Se almacena directamente en Supabase Storage."
              onUploadingChange={setIsUploadingProof}
            />
            {state.fieldErrors?.proofImageUrl && (
              <p className="text-xs text-destructive">{state.fieldErrors.proofImageUrl[0]}</p>
            )}
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
            disabled={isFullyCovered}
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
          disabled={isSubmitDisabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isUploadingProof ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subiendo Comprobante...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando Pago...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              {isFullyCovered ? 'Reserva Sin Saldo Pendiente' : 'Registrar Abono'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
