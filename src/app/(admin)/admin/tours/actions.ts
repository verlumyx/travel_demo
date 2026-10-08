'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createTourSchema } from '@/modules/tour/validation/create-tour.schema';
import { updateTourSchema } from '@/modules/tour/validation/update-tour.schema';
import { updateStatusTourSchema } from '@/modules/tour/validation/update-status-tour.schema';
import { CreateTourCommand } from '@/modules/tour/commands/create-tour.command';
import { UpdateTourCommand } from '@/modules/tour/commands/update-tour.command';
import { UpdateStatusTourCommand } from '@/modules/tour/commands/update-status-tour.command';
import { createTourContainer } from '@/modules/tour/container';
import { tourRoutes } from '@/modules/tour/routes';
import { createItineraryStopSchema } from '@/modules/itinerary-stop/validation/create-itinerary-stop.schema';
import { updateItineraryStopSchema } from '@/modules/itinerary-stop/validation/update-itinerary-stop.schema';
import { CreateItineraryStopCommand } from '@/modules/itinerary-stop/commands/create-itinerary-stop.command';
import { UpdateItineraryStopCommand } from '@/modules/itinerary-stop/commands/update-itinerary-stop.command';
import { createItineraryStopContainer } from '@/modules/itinerary-stop/container';

const uuidSchema = z.string().uuid();

export async function createTourAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    await requirePermission('tours.create');

    const rawData = {
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      shortDescription: formData.get('shortDescription') || null,
      imageUrl: formData.get('imageUrl') || null,
      durationDays: formData.get('durationDays') ? Number(formData.get('durationDays')) : 1,
      basePrice: formData.get('basePrice'),
      currency: formData.get('currency') || 'USD',
      includesFood: formData.get('includesFood') === 'on' || formData.get('includesFood') === 'true',
      includesLodging: formData.get('includesLodging') === 'on' || formData.get('includesLodging') === 'true',
      inclusions: formData.get('inclusions') || null,
      exclusions: formData.get('exclusions') || null,
      status: formData.get('status') || 'draft',
    };

    const parsed = createTourSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateTourCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createTourContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(tourRoutes.list());
  await setFlash('success', 'Tour creado exitosamente.');
  redirect(tourRoutes.list());
}

export async function updateTourAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('tours.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de tour inválido.' };
    }

    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      shortDescription: formData.get('shortDescription') || null,
      imageUrl: formData.get('imageUrl') || null,
      durationDays: formData.get('durationDays') ? Number(formData.get('durationDays')) : 1,
      basePrice: formData.get('basePrice'),
      currency: formData.get('currency') || 'USD',
      includesFood: formData.get('includesFood') === 'on' || formData.get('includesFood') === 'true',
      includesLodging: formData.get('includesLodging') === 'on' || formData.get('includesLodging') === 'true',
      inclusions: formData.get('inclusions') || null,
      exclusions: formData.get('exclusions') || null,
      status: formData.get('status') || 'draft',
    };

    const parsed = updateTourSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateTourCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createTourContainer(tx);
      await container.updateService.execute(id, command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(tourRoutes.list());
  revalidatePath(tourRoutes.show(id));
  await setFlash('success', 'Tour actualizado exitosamente.');
  redirect(tourRoutes.list());
}

export async function updateTourStatusAction(
  id: string,
  status: 'draft' | 'active' | 'inactive',
): Promise<ActionState> {
  try {
    await requirePermission('tours.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de tour inválido.' };
    }

    const parsed = updateStatusTourSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    const command = UpdateStatusTourCommand.fromInput(parsed.data);
    const container = createTourContainer(db);
    await container.updateStatusService.execute(id, command);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(tourRoutes.list());
  revalidatePath(tourRoutes.show(id));
  await setFlash('success', `Estado de tour actualizado a ${status}.`);
  return { status: 'idle' };
}

export async function createItineraryStopAction(
  tourId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('itinerary-stops.create');

    if (!uuidSchema.safeParse(tourId).success) {
      return { status: 'error', message: 'ID de tour inválido.' };
    }

    const rawData = {
      tourId,
      destinationId: formData.get('destinationId'),
      dayNumber: Number(formData.get('dayNumber') || 1),
      sortOrder: Number(formData.get('sortOrder') || 0),
      title: formData.get('title'),
      description: formData.get('description') || null,
      overnightStay: formData.get('overnightStay') === 'on' || formData.get('overnightStay') === 'true',
    };

    const parsed = createItineraryStopSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateItineraryStopCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createItineraryStopContainer(tx);
      await container.createService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(tourRoutes.show(tourId));
  await setFlash('success', 'Parada de itinerario agregada exitosamente.');
  return { status: 'idle' };
}
