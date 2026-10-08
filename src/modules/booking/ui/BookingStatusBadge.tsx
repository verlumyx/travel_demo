interface BookingStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled';
  className?: string;
}

export function BookingStatusBadge({
  status,
  className = '',
}: BookingStatusBadgeProps) {
  if (status === 'paid') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Pagado
      </span>
    );
  }

  if (status === 'partial_payment') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Abono Parcial
      </span>
    );
  }

  if (status === 'confirmed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        Confirmada
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Pendiente Pago
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Cancelada
    </span>
  );
}
