'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerStatusAction } from '@/app/(admin)/admin/customers/actions';

interface CustomerStatusToggleProps {
  id: string;
  currentStatus: 'active' | 'inactive';
}

export function CustomerStatusToggle({
  id,
  currentStatus,
}: CustomerStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';

  function handleToggle() {
    startTransition(async () => {
      await updateCustomerStatusAction(id, nextStatus);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium disabled:opacity-50 ${
        currentStatus === 'active'
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
      }`}
    >
      {isPending
        ? 'Cambiando...'
        : currentStatus === 'active'
          ? 'Desactivar'
          : 'Activar'}
    </button>
  );
}
