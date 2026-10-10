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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer disabled:opacity-50 shadow-sm ${
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
