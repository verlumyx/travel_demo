'use client';

import { useTransition } from 'react';
import { verifyPaymentAction, rejectPaymentAction } from '@/app/(admin)/admin/payments/actions';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface PaymentVerifyActionsProps {
  paymentId: string;
  status: 'pending' | 'verified' | 'rejected' | string;
}

export function PaymentVerifyActions({ paymentId, status }: PaymentVerifyActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    if (confirm('¿Desea verificar y conciliar este pago? Esto actualizará el saldo y estado de la reserva.')) {
      startTransition(async () => {
        await verifyPaymentAction(paymentId);
      });
    }
  };

  const handleReject = () => {
    if (confirm('¿Está seguro de rechazar este pago? Si ya había sido acreditado, el saldo se revertirá.')) {
      startTransition(async () => {
        await rejectPaymentAction(paymentId);
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status !== 'verified' && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Aprobar y Conciliar
        </button>
      )}

      {status !== 'rejected' && (
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          Rechazar Pago
        </button>
      )}
    </div>
  );
}
