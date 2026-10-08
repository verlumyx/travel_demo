'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateDepartureStatusAction } from '@/app/(admin)/admin/departures/actions';
import type { DepartureRow } from '../models/departure.model';

interface DepartureStatusSelectProps {
  id: string;
  currentStatus: DepartureRow['status'];
}

const STATUS_OPTIONS: { value: DepartureRow['status']; label: string }[] = [
  { value: 'scheduled', label: 'Programada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'En Curso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function DepartureStatusSelect({
  id,
  currentStatus,
}: DepartureStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = e.target.value as DepartureRow['status'];
    if (nextStatus === currentStatus) return;

    if (
      nextStatus === 'cancelled' &&
      !confirm('¿Estás seguro de que deseas cancelar esta salida programada?')
    ) {
      e.target.value = currentStatus;
      return;
    }

    startTransition(async () => {
      await updateDepartureStatusAction(id, nextStatus);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`status-select-${id}`} className="text-xs font-medium text-muted-foreground">
        Estado:
      </label>
      <select
        id={`status-select-${id}`}
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="text-xs font-medium rounded-lg border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-colors shadow-xs"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isPending && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Actualizando...
        </span>
      )}
    </div>
  );
}
