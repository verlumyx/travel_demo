'use client';

import { useTransition } from 'react';
import { toggleUserStatusAction } from '@/app/(admin)/admin/users/actions';
import { Power } from 'lucide-react';

interface Props {
  id: string;
  currentStatus: 'active' | 'inactive';
}

export function UserStatusToggle({ id, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleUserStatusAction(id, currentStatus);
    });
  };

  const isActive = currentStatus === 'active';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
      className={`p-1.5 rounded-lg border transition-all ${
        isActive
          ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
          : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
      } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      <Power className="h-4 w-4" />
    </button>
  );
}
