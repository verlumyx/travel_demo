'use client';

import { useTransition } from 'react';
import { updateTourStatusAction } from '@/app/(admin)/admin/tours/actions';
import { Loader2 } from 'lucide-react';

export function TourStatusToggle({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'inactive') => {
    startTransition(async () => {
      await updateTourStatusAction(id, newStatus);
    });
  };

  return (
    <div className="inline-flex items-center gap-1">
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as any)}
        disabled={isPending}
        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer disabled:opacity-50 transition shadow-sm"
      >
        <option value="draft">Borrador</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
      </select>
    </div>
  );
}
