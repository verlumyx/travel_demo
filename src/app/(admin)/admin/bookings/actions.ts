'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createBookingSchema } from '@/modules/booking/validation/create-booking.schema';
import { updateBookingSchema } from '@/modules/booking/validation/update-booking.schema';
import { updateStatusBookingSchema } from '@/modules/booking/validation/update-status-booking.schema';
import { CreateBookingCommand } from '@/modules/booking/commands/create-booking.command';
import { UpdateBookingCommand } from '@/modules/booking/commands/update-booking.command';
import { UpdateStatusBookingCommand } from '@/modules/booking/commands/update-status-booking.command';
import { createBookingContainer } from '@/modules/booking/container';
import { bookingRoutes } from '@/modules/booking/routes';
import { departureRoutes } from '@/modules/departure/routes';

const uuidSchema = z.string().uuid();

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string | null = null;
  let departureIdToRevalidate: string | null = null;

  try {
    await requirePermission('bookings.create');

    const passengersRaw = formData.get('passengersJson');
    let parsedPassengers = [];
    try {
      parsedPassengers = passengersRaw ? JSON.parse(String(passengersRaw)) : [];
    } catch {
      return { status: 'error', message: 'Formato de pasajeros inválido.' };
    }

    const rawData = {
      id: formData.get('id'),
      departureId: formData.get('departureId'),
      customerId: formData.get('customerId'),
      slotsReserved: formData.get('slotsReserved'),
      totalAmount: formData.get('totalAmount'),
      notes: formData.get('notes') || null,
      source: 'admin' as const,
      passengers: parsedPassengers,
    };

    departureIdToRevalidate = String(rawData.departureId);

    const parsed = createBookingSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = CreateBookingCommand.fromInput(parsed.data);

    await db.transaction(async (tx) => {
      const container = createBookingContainer(tx);
      const row = await container.createService.execute(command);
      createdId = row.id;
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(bookingRoutes.list());
  if (departureIdToRevalidate) {
    revalidatePath(departureRoutes.show(departureIdToRevalidate));
  }
  await setFlash('success', 'Reserva emitida exitosamente con bloqueo de cupos.');
  redirect(bookingRoutes.show(createdId!));
}

export async function updateBookingAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('bookings.update');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de reserva inválido.' };
    }

    const rawData = {
      notes: formData.get('notes') || null,
    };

    const parsed = updateBookingSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const command = UpdateBookingCommand.fromInput(id, parsed.data);

    await db.transaction(async (tx) => {
      const container = createBookingContainer(tx);
      await container.updateService.execute(command);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(bookingRoutes.list());
  revalidatePath(bookingRoutes.show(id));
  await setFlash('success', 'Reserva actualizada exitosamente.');
  redirect(bookingRoutes.show(id));
}

export async function cancelBookingAction(id: string): Promise<ActionState> {
  try {
    await requirePermission('bookings.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de reserva inválido.' };
    }

    await db.transaction(async (tx) => {
      const container = createBookingContainer(tx);
      await container.repository.cancel(id);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(bookingRoutes.list());
  revalidatePath(bookingRoutes.show(id));
  await setFlash('success', 'Reserva cancelada y cupos devueltos a la salida.');
  return { status: 'idle' };
}

export async function updateBookingStatusAction(
  id: string,
  status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled',
): Promise<ActionState> {
  try {
    await requirePermission('bookings.update-status');

    if (!uuidSchema.safeParse(id).success) {
      return { status: 'error', message: 'ID de reserva inválido.' };
    }

    const parsed = updateStatusBookingSchema.safeParse({ status });
    if (!parsed.success) {
      return { status: 'error', message: 'Estado inválido.' };
    }

    await db.transaction(async (tx) => {
      const container = createBookingContainer(tx);
      await container.repository.updateStatus(id, status);
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(bookingRoutes.list());
  revalidatePath(bookingRoutes.show(id));
  await setFlash('success', `Estado de reserva actualizado a ${status}.`);
  return { status: 'idle' };
}
