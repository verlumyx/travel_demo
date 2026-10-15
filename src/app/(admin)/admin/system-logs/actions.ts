'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { createSystemLogContainer } from '@/modules/system-log/container';
import { type ActionState, toActionError } from '@/modules/shared/actions/action-state';

export async function updateSystemLogStatusAction(
  id: string,
  status: 'unread' | 'investigating' | 'resolved',
): Promise<ActionState> {
  try {
    await requirePermission('system-logs.list');

    const container = createSystemLogContainer();
    await container.statusService.execute(id, status);

    revalidatePath('/admin/system-logs');
    return {
      status: 'idle',
      message: `Registro marcado como ${status === 'resolved' ? 'resuelto' : status === 'investigating' ? 'en revisión' : 'no leído'}.`,
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function clearResolvedLogsAction(): Promise<ActionState> {
  try {
    await requirePermission('system-logs.clear');

    const container = createSystemLogContainer();
    const count = await container.statusService.clearResolved();

    revalidatePath('/admin/system-logs');
    return {
      status: 'idle',
      message: `Se eliminaron ${count} registros con estado 'resuelto'.`,
    };

  } catch (error) {
    return toActionError(error);
  }
}
