'use client';

import { useTransition } from 'react';
import { updatePaymentMethodStatusAction } from '@/app/(admin)/admin/payment-methods/actions';
import { Power, Loader2 } from 'lucide-react';

export function PaymentMethodStatusToggle({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: 'active' | 'inactive';
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    startTransition(async () => {
      await updatePaymentMethodStatusAction(id, nextStatus);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={currentStatus === 'active' ? 'Desactivar método de pago' : 'Activar método de pago'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer disabled:opacity-50 shadow-2xs ${
        currentStatus === 'active'
          ? 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Power className="h-3.5 w-3.5" />
      )}
      {currentStatus === 'active' ? 'Desactivar' : 'Activar'}
    </button>
  );
}
