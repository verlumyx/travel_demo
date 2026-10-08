'use client';

import { useActionState, useState } from 'react';
import { customerReportPaymentAction } from '@/app/(catalogo)/cuenta/actions';
import {
  CreditCard,
  DollarSign,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface CustomerReportPaymentFormProps {
  bookingId: string;
  bookingCode: string;
  pendingBalance: string;
}

export function CustomerReportPaymentForm({
  bookingId,
  bookingCode,
  pendingBalance,
}: CustomerReportPaymentFormProps) {
  const [state, formAction, isPending] = useActionState(customerReportPaymentAction, {
    status: 'idle',
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Reportar Abono o Pago Adicional
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            ¿Realizaste una transferencia o pago móvil? Carga los datos de tu comprobante para conciliarlo.
          </p>
        </div>

        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <DollarSign className="h-4 w-4" />
            Reportar Pago (${pendingBalance} USD pendiente)
          </button>
        )}
      </div>

      {isOpen && (
        <form action={formAction} className="pt-4 border-t border-border space-y-4">
          <input type="hidden" name="bookingId" value={bookingId} />

          {state.message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                state.status === 'error'
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}
            >
              {state.status === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              {state.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="method" className="font-medium text-foreground">
                Método de Pago *
              </label>
              <select
                id="method"
                name="method"
                defaultValue="pago_movil"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
                required
              >
                <option value="pago_movil">Pago Móvil (VES)</option>
                <option value="zelle">Zelle (USD)</option>
                <option value="binance">Binance Pay (USDT)</option>
                <option value="zinli">Zinli (USD)</option>
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="cash_usd">Efectivo USD (Entregado a Asesor)</option>
              </select>
              {state.fieldErrors?.method && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.method[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="amount" className="font-medium text-foreground">
                Monto Abonado (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  defaultValue={pendingBalance}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-input bg-background font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              {state.fieldErrors?.amount && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.amount[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reference" className="font-medium text-foreground">
                Número de Referencia / Transacción *
              </label>
              <input
                id="reference"
                name="reference"
                type="text"
                placeholder="Ej: Ref 0847291, Hash #92819"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background font-mono focus:outline-hidden focus:ring-2 focus:ring-ring"
                required
              />
              {state.fieldErrors?.reference && (
                <p className="text-destructive text-[11px]">{state.fieldErrors.reference[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proofImageUrl" className="font-medium text-foreground">
                Enlace / URL de la Captura del Pago (Opcional)
              </label>
              <input
                id="proofImageUrl"
                name="proofImageUrl"
                type="url"
                placeholder="https://... o enlace a tu comprobante"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="notes" className="font-medium text-foreground">
                Comentarios Adicionales
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Indica cualquier detalle sobre tu pago (ej. banco emisor, titular de la cuenta)..."
                className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando comprobante...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Enviar Comprobante
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
