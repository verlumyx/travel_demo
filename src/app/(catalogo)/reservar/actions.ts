'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq, like, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { departures } from '@/modules/departure/models/departure.model';
import { tours } from '@/modules/tour/models/tour.model';
import {
  customers,
  CUSTOMER_CODE_PREFIX,
  CUSTOMER_CODE_WIDTH,
} from '@/modules/customer/models/customer.model';
import {
  bookings,
  BOOKING_CODE_PREFIX,
  BOOKING_CODE_WIDTH,
} from '@/modules/booking/models/booking.model';
import { passengers } from '@/modules/passenger/models/passenger.model';
import {
  payments,
  PAYMENT_CODE_PREFIX,
  PAYMENT_CODE_WIDTH,
} from '@/modules/payment/models/payment.model';
import { DomainError } from '@/modules/shared/exceptions/domain-error';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';

const passengerInputSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  lastName: z.string().min(1, 'El apellido es obligatorio.'),
  documentType: z.enum(['cedula', 'passport', 'other']).optional().default('cedula'),
  documentNumber: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isMainContact: z.boolean().optional().default(false),
});

const clientCheckoutSchema = z.object({
  departureId: z.string().uuid({ message: 'Salida inválida.' }),
  slotsCount: z.coerce.number().int().min(1, 'Debe reservar al menos 1 cupo.').max(20),
  // Main customer details
  holderFirstName: z.string().min(1, 'El nombre del titular es obligatorio.'),
  holderLastName: z.string().min(1, 'El apellido del titular es obligatorio.'),
  holderEmail: z.string().email('Correo electrónico no válido.'),
  holderPhone: z.string().min(6, 'Teléfono de contacto obligatorio.'),
  holderDocumentType: z.enum(['cedula', 'passport', 'other']).default('cedula'),
  holderDocumentNumber: z.string().min(1, 'Número de cédula o pasaporte obligatorio.'),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  // Accompanying passengers (if slotsCount > 1)
  passengersJson: z.string().optional(),
  // Payment reporting
  paymentMethod: z.enum([
    'pago_movil',
    'zelle',
    'binance',
    'zinli',
    'bank_transfer',
    'cash_usd',
    'cash_ves',
  ]),
  paymentReference: z.string().min(2, 'Número de referencia bancaria obligatorio.'),
  proofImageUrl: z.string().url('URL de captura no válida.').optional().or(z.literal('')),
  notes: z.string().optional().nullable(),
});

export async function clientCheckoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdBookingCode: string | null = null;
  let createdBookingId: string | null = null;
  let departureId: string | null = null;

  try {
    const rawData = {
      departureId: formData.get('departureId'),
      slotsCount: formData.get('slotsCount'),
      holderFirstName: formData.get('holderFirstName'),
      holderLastName: formData.get('holderLastName'),
      holderEmail: formData.get('holderEmail'),
      holderPhone: formData.get('holderPhone'),
      holderDocumentType: formData.get('holderDocumentType') || 'cedula',
      holderDocumentNumber: formData.get('holderDocumentNumber'),
      emergencyContact: formData.get('emergencyContact') || null,
      emergencyPhone: formData.get('emergencyPhone') || null,
      passengersJson: formData.get('passengersJson') || '[]',
      paymentMethod: formData.get('paymentMethod'),
      paymentReference: formData.get('paymentReference'),
      proofImageUrl: formData.get('proofImageUrl') || '',
      notes: formData.get('notes') || null,
    };

    const parsed = clientCheckoutSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;
    departureId = data.departureId;

    let companionPassengers: z.infer<typeof passengerInputSchema>[] = [];
    if (data.passengersJson) {
      try {
        const rawArray = JSON.parse(data.passengersJson);
        companionPassengers = z.array(passengerInputSchema).parse(rawArray);
      } catch {
        return { status: 'error', message: 'Datos de acompañantes con formato inválido.' };
      }
    }

    await db.transaction(async (tx) => {
      // 1. Lock departure and check capacity
      const [dep] = await tx
        .select()
        .from(departures)
        .where(eq(departures.id, data.departureId))
        .for('update');

      if (!dep) {
        throw new DomainError('La salida programada no existe.');
      }

      if (dep.status === 'completed' || dep.status === 'cancelled') {
        throw new DomainError('Esta salida se encuentra cerrada o cancelada.');
      }

      const availableSlots = dep.totalCapacity - dep.bookedSlots;
      if (data.slotsCount > availableSlots) {
        throw new DomainError(
          `Solo quedan ${availableSlots} cupos disponibles para esta salida. Has solicitado ${data.slotsCount}.`,
        );
      }

      // 2. Fetch tour price
      const [tour] = await tx
        .select()
        .from(tours)
        .where(eq(tours.id, dep.tourId));

      if (!tour) {
        throw new DomainError('El tour seleccionado no existe.');
      }

      const effectiveUnitPrice = dep.priceOverride ? Number(dep.priceOverride) : Number(tour.basePrice);
      const totalAmount = (effectiveUnitPrice * data.slotsCount).toFixed(2);

      // 3. Find or create customer
      const cleanEmail = data.holderEmail.toLowerCase().trim();
      let [customer] = await tx
        .select()
        .from(customers)
        .where(eq(customers.email, cleanEmail))
        .limit(1);

      if (!customer) {
        // Generate atomic customer code
        const custScope = like(customers.code, `${CUSTOMER_CODE_PREFIX}%`);
        await tx
          .select({ id: customers.id })
          .from(customers)
          .where(custScope)
          .orderBy(desc(customers.code))
          .limit(1)
          .for('update');

        const [lastCust] = await tx
          .select({ code: customers.code })
          .from(customers)
          .where(custScope)
          .orderBy(desc(customers.code))
          .limit(1);

        const nextCustNum = lastCust
          ? Number(lastCust.code.slice(CUSTOMER_CODE_PREFIX.length)) + 1
          : 1;
        const custCode = `${CUSTOMER_CODE_PREFIX}${String(nextCustNum).padStart(
          CUSTOMER_CODE_WIDTH,
          '0',
        )}`;

        const [newCust] = await tx
          .insert(customers)
          .values({
            id: crypto.randomUUID(),
            code: custCode,
            firstName: data.holderFirstName.trim(),
            lastName: data.holderLastName.trim(),
            email: cleanEmail,
            phone: data.holderPhone.trim(),
            documentType: data.holderDocumentType,
            documentNumber: data.holderDocumentNumber.trim(),
            emergencyContact: data.emergencyContact,
            emergencyPhone: data.emergencyPhone,
            source: 'portal',
            status: 'active',
          })
          .returning();
        customer = newCust;
      }

      // 4. Generate atomic booking code
      const bookScope = like(bookings.code, `${BOOKING_CODE_PREFIX}%`);
      await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(bookScope)
        .orderBy(desc(bookings.code))
        .limit(1)
        .for('update');

      const [lastBook] = await tx
        .select({ code: bookings.code })
        .from(bookings)
        .where(bookScope)
        .orderBy(desc(bookings.code))
        .limit(1);

      const nextBookNum = lastBook
        ? Number(lastBook.code.slice(BOOKING_CODE_PREFIX.length)) + 1
        : 1;
      const bookingCode = `${BOOKING_CODE_PREFIX}${String(nextBookNum).padStart(
        BOOKING_CODE_WIDTH,
        '0',
      )}`;

      const bookingId = crypto.randomUUID();
      createdBookingId = bookingId;
      createdBookingCode = bookingCode;

      // 5. Insert booking (starts as pending)
      await tx.insert(bookings).values({
        id: bookingId,
        code: bookingCode,
        departureId: dep.id,
        customerId: customer.id,
        slotsReserved: data.slotsCount,
        totalAmount,
        paidAmount: '0.00',
        notes: data.notes || 'Reserva online autoservicio desde el catálogo web.',
        source: 'portal',
        status: 'pending',
      });

      // 6. Insert Main passenger (Titular)
      const allPassengersToInsert = [
        {
          id: crypto.randomUUID(),
          bookingId,
          firstName: data.holderFirstName.trim(),
          lastName: data.holderLastName.trim(),
          documentType: data.holderDocumentType,
          documentNumber: data.holderDocumentNumber.trim(),
          phone: data.holderPhone.trim(),
          isMainContact: true,
          notes: 'Titular de la reserva',
        },
        ...companionPassengers.map((cp, idx) => ({
          id: crypto.randomUUID(),
          bookingId,
          firstName: cp.firstName.trim(),
          lastName: cp.lastName.trim(),
          documentType: cp.documentType || 'cedula',
          documentNumber: cp.documentNumber?.trim() || null,
          phone: cp.phone?.trim() || null,
          isMainContact: false,
          notes: `Acompañante #${idx + 2}`,
        })),
      ];

      await tx.insert(passengers).values(allPassengersToInsert);

      // 7. Increment departure bookedSlots atomically
      await tx
        .update(departures)
        .set({
          bookedSlots: dep.bookedSlots + data.slotsCount,
          updatedAt: new Date(),
        })
        .where(eq(departures.id, dep.id));

      // 8. Generate atomic payment code and record reported payment
      const payScope = like(payments.code, `${PAYMENT_CODE_PREFIX}%`);
      await tx
        .select({ id: payments.id })
        .from(payments)
        .where(payScope)
        .orderBy(desc(payments.code))
        .limit(1)
        .for('update');

      const [lastPay] = await tx
        .select({ code: payments.code })
        .from(payments)
        .where(payScope)
        .orderBy(desc(payments.code))
        .limit(1);

      const nextPayNum = lastPay
        ? Number(lastPay.code.slice(PAYMENT_CODE_PREFIX.length)) + 1
        : 1;
      const paymentCode = `${PAYMENT_CODE_PREFIX}${String(nextPayNum).padStart(
        PAYMENT_CODE_WIDTH,
        '0',
      )}`;

      await tx.insert(payments).values({
        id: crypto.randomUUID(),
        code: paymentCode,
        bookingId,
        method: data.paymentMethod,
        amount: totalAmount,
        currency: 'USD',
        reference: data.paymentReference.trim(),
        proofImageUrl: data.proofImageUrl || null,
        paymentDate: new Date(),
        receivedByName: 'Reportado por cliente en checkout web',
        notes: `Comprobante ingresado durante el autoservicio online.`,
        status: 'pending',
      });
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath('/tours');
  revalidatePath(`/reservar/${departureId}`);
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/payments');

  redirect(
    `/reservar/${departureId}/exito?bookingCode=${createdBookingCode}&bookingId=${createdBookingId}`,
  );
}
