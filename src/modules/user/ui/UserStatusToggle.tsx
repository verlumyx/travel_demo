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
          ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
          : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
      } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      <Power className="h-4 w-4" />
    </button>
  );
}
