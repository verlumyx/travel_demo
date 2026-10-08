'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { setFlash } from '@/modules/shared/flash/flash';
import { db } from '@/db/client';
import { createUserContainer } from '@/modules/user/container';
import { UpdateStatusUserCommand } from '@/modules/user/commands/update-status-user.command';

export async function toggleUserStatusAction(id: string, currentStatus: 'active' | 'inactive') {
  try {
    await requirePermission('users.update-status');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const container = createUserContainer(db);
    const command = new UpdateStatusUserCommand({ status: newStatus });
    await container.updateStatusService.execute(id, command);

    await setFlash(
      'success',
      `Estado de usuario actualizado a ${newStatus === 'active' ? 'Activo' : 'Inactivo'}.`,
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar estado del usuario';
    await setFlash('error', message);
    return { success: false, error: message };
  }
}
