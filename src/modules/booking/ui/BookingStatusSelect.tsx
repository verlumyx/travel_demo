'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateBookingStatusAction } from '@/app/(admin)/admin/bookings/actions';

interface BookingStatusSelectProps {
  id: string;
  currentStatus: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled';
}

const STATUS_OPTIONS: { value: BookingStatusSelectProps['currentStatus']; label: string }[] = [
  { value: 'pending', label: 'Pendiente Pago' },
  { value: 'partial_payment', label: 'Abono Parcial' },
  { value: 'paid', label: 'Pagado' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function BookingStatusSelect({
  id,
  currentStatus,
}: BookingStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = e.target.value as BookingStatusSelectProps['currentStatus'];
    if (nextStatus === currentStatus) return;

    if (
      nextStatus === 'cancelled' &&
      !confirm('¿Estás seguro de cancelar esta reserva? Los cupos se liberarán y volverán a estar disponibles en la salida.')
    ) {
      e.target.value = currentStatus;
      return;
    }

    startTransition(async () => {
      await updateBookingStatusAction(id, nextStatus);
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
