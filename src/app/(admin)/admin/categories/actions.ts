'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createCategorySchema } from '@/modules/category/validation/create-category.schema';
import { updateCategorySchema } from '@/modules/category/validation/update-category.schema';
import { updateStatusCategorySchema } from '@/modules/category/validation/update-status-category.schema';
import { CreateCategoryCommand } from '@/modules/category/commands/create-category.command';
import { UpdateCategoryCommand } from '@/modules/category/commands/update-category.command';
import { UpdateStatusCategoryCommand } from '@/modules/category/commands/update-status-category.command';
import { createCategoryContainer } from '@/modules/category/container';
import { categoryRoutes } from '@/modules/category/routes';

const uuidSchema = z.string().uuid();

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    await requirePermission('categories.create');

    const rawData = {
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      icon: formData.get('icon') || null,
      imageUrl: formData.get('imageUrl') || null,
    };

    const parsed = createCategorySchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateCategoryCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createCategoryContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(categoryRoutes.list());
  await setFlash('success', 'Categoría creada exitosamente.');
  redirect(categoryRoutes.list());
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('categories.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de categoría inválido.' };
    }

    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      icon: formData.get('icon') || null,
      imageUrl: formData.get('imageUrl') || null,
    };

    const parsed = updateCategorySchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateCategoryCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createCategoryContainer(tx);
      await container.updateService.execute(id, command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(categoryRoutes.list());
  revalidatePath(categoryRoutes.show(id));
  await setFlash('success', 'Categoría actualizada exitosamente.');
  redirect(categoryRoutes.list());
}

export async function updateCategoryStatusAction(
  id: string,
  status: 'active' | 'inactive',
): Promise<ActionState> {
  try {
    await requirePermission('categories.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de categoría inválido.' };
    }

    const parsed = updateStatusCategorySchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    const command = UpdateStatusCategoryCommand.fromInput(parsed.data);
    const container = createCategoryContainer(db);
    await container.updateStatusService.execute(id, command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(categoryRoutes.list());
  revalidatePath(categoryRoutes.show(id));
  await setFlash('success', `Categoría ${status === 'active' ? 'activada' : 'desactivada'} correctamente.`);
  return { status: 'idle' };
}
