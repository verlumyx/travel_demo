'use client';

import { useTransition } from 'react';
import { updateCategoryStatusAction } from '@/app/(admin)/admin/categories/actions';
import { Power, Loader2 } from 'lucide-react';

export function CategoryStatusToggle({
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
      await updateCategoryStatusAction(id, nextStatus);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={currentStatus === 'active' ? 'Desactivar categoría' : 'Activar categoría'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer disabled:opacity-50 ${
        currentStatus === 'active'
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
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
