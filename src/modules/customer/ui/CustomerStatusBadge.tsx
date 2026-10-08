interface CustomerStatusBadgeProps {
  status: 'active' | 'inactive';
  className?: string;
}

export function CustomerStatusBadge({
  status,
  className = '',
}: CustomerStatusBadgeProps) {
  if (status === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Activo
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Inactivo
    </span>
  );
}
