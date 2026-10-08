'use client';

import { useTransition } from 'react';
import { updateTransportUnitStatusAction } from '@/app/(admin)/admin/transport-units/actions';
import { Loader2 } from 'lucide-react';

export function TransportUnitStatusToggle({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: 'active' | 'inactive' | 'maintenance';
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: 'active' | 'inactive' | 'maintenance') => {
    startTransition(async () => {
      await updateTransportUnitStatusAction(id, newStatus);
    });
  };

  return (
    <div className="inline-flex items-center gap-1">
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as any)}
        disabled={isPending}
        className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
      >
        <option value="active">Operativa</option>
        <option value="maintenance">Mantenimiento</option>
        <option value="inactive">Inactiva</option>
      </select>
    </div>
  );
}
