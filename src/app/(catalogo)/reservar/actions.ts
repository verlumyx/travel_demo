'use server';
 
import fs from 'node:fs/promises';
import path from 'node:path';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db/client';
import { createDepartureContainer } from '@/modules/departure/container';
import { createCustomerContainer } from '@/modules/customer/container';
import { createBookingContainer } from '@/modules/booking/container';
import { createPaymentContainer } from '@/modules/payment/container';
import { CreateCustomerCommand } from '@/modules/customer/commands/create-customer.command';
import { UpdateCustomerCommand } from '@/modules/customer/commands/update-customer.command';
import { toCustomerDto, type CustomerDto } from '@/modules/customer/serializers/customer.serializer';
import { CreateBookingCommand } from '@/modules/booking/commands/create-booking.command';
import { CreatePaymentCommand } from '@/modules/payment/commands/create-payment.command';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';

export type CheckCustomerResult = {
  found: boolean;
  customer?: CustomerDto;
  error?: string;
};

export async function checkCustomerByEmailAction(email: string): Promise<CheckCustomerResult> {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { found: false, error: 'Por favor ingresa un correo electrónico válido.' };
    }

    const customerContainer = createCustomerContainer();
    const customer = await customerContainer.findService.findByEmail(cleanEmail);

    if (!customer) {
      return { found: false };
    }

    return {
      found: true,
      customer: toCustomerDto(customer),
    };
  } catch (error) {
    console.error('Error comprobando correo del cliente:', error);
    return { found: false, error: 'No se pudo consultar el cliente en el sistema.' };
  }
}

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
  paymentMethod: z.string().min(1, 'El método de pago es obligatorio.').max(50),
  paymentReference: z.string().optional().nullable(),
  paymentDate: z.string().optional().nullable(),
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
    const rawPaymentMethod = formData.get('paymentMethod');
    const isCash = rawPaymentMethod === 'cash_usd' || rawPaymentMethod === 'cash_ves';

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
      paymentMethod: rawPaymentMethod,
      paymentReference: formData.get('paymentReference'),
      paymentDate: formData.get('paymentDate'),
      notes: formData.get('notes') || null,
    };

    if (!isCash) {
      const refStr = (rawData.paymentReference || '').toString().trim();
      if (refStr.length < 2) {
        return {
          status: 'error',
          fieldErrors: {
            paymentReference: ['Número de referencia bancaria obligatorio.'],
          },
        };
      }

      const dateStr = (rawData.paymentDate || '').toString().trim();
      if (!dateStr) {
        return {
          status: 'error',
          fieldErrors: {
            paymentDate: ['Fecha de realización del pago obligatoria.'],
          },
        };
      }
    }

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

    // Process file upload if provided
    const proofFile = formData.get('proofFile') as File | null;
    let uploadedProofUrl: string | undefined = undefined;

    if (!isCash && proofFile && typeof proofFile === 'object' && proofFile.size > 0 && proofFile.name) {
      const bytes = await proofFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const rawExt = proofFile.name.split('.').pop()?.toLowerCase() || 'png';
      const allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];
      const ext = allowedExts.includes(rawExt) ? rawExt : 'png';
      const fileName = `payments/proof_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

      try {
        const supabase = createSupabaseAdminClient();
        const { error: uploadError } = await supabase.storage
          .from('travel-media')
          .upload(fileName, buffer, {
            contentType: proofFile.type || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg'),
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error al subir comprobante a Supabase Storage:', uploadError);
          // Fallback a almacenamiento local si Supabase tiene algún inconveniente
          const localFileName = `proof_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payments');
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(path.join(uploadDir, localFileName), buffer);
          uploadedProofUrl = `/uploads/payments/${localFileName}`;
        } else {
          const { data: publicData } = supabase.storage
            .from('travel-media')
            .getPublicUrl(fileName);
          uploadedProofUrl = publicData.publicUrl;
        }
      } catch (storageErr) {
        console.error('Excepción al conectar con Supabase Storage:', storageErr);
        const localFileName = `proof_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payments');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, localFileName), buffer);
        uploadedProofUrl = `/uploads/payments/${localFileName}`;
      }
    }

    let effectivePaymentDate = new Date();
    if (data.paymentDate && data.paymentDate.trim()) {
      const parsedDate = new Date(`${data.paymentDate.trim()}T12:00:00Z`);
      if (!isNaN(parsedDate.getTime())) {
        effectivePaymentDate = parsedDate;
      }
    }

    const effectiveReference = isCash
      ? 'PAGO EN EFECTIVO'
      : (data.paymentReference?.trim() || 'SIN REFERENCIA');

    await db.transaction(async (tx) => {
      const departureContainer = createDepartureContainer(tx);
      const customerContainer = createCustomerContainer(tx);
      const bookingContainer = createBookingContainer(tx);
      const paymentContainer = createPaymentContainer(tx);

      // 1. Fetch departure with tour to determine unit price & capacity
      const { departure: dep, tour } = await departureContainer.findService.executeWithTour(data.departureId);
      const effectiveUnitPrice = dep.priceOverride ? Number(dep.priceOverride) : Number(tour.basePrice);
      const totalAmount = (effectiveUnitPrice * data.slotsCount).toFixed(2);

      // 2. Find or create/update customer
      const cleanEmail = data.holderEmail.toLowerCase().trim();
      let customer = await customerContainer.findService.findByEmail(cleanEmail);
      if (!customer) {
        customer = await customerContainer.createService.execute(
          CreateCustomerCommand.fromInput({
            id: crypto.randomUUID(),
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
          }),
        );
      } else {
        // Actualizar datos del cliente existente si aportó datos actualizados
        customer = await customerContainer.updateService.execute(
          UpdateCustomerCommand.fromInput(customer.id, {
            firstName: data.holderFirstName.trim() || customer.firstName,
            lastName: data.holderLastName.trim() || customer.lastName,
            email: cleanEmail,
            phone: data.holderPhone.trim() || customer.phone,
            documentType: data.holderDocumentType || customer.documentType,
            documentNumber: data.holderDocumentNumber.trim() || customer.documentNumber,
            emergencyContact: data.emergencyContact ?? customer.emergencyContact,
            emergencyPhone: data.emergencyPhone ?? customer.emergencyPhone,
            source: customer.source || 'portal',
            notes: customer.notes || undefined,
          }),
        );
      }

      // 3. Prepare all passengers
      const allPassengers = [
        {
          firstName: data.holderFirstName.trim(),
          lastName: data.holderLastName.trim(),
          documentType: data.holderDocumentType,
          documentNumber: data.holderDocumentNumber.trim(),
          phone: data.holderPhone.trim(),
          isMainContact: true,
          notes: 'Titular de la reserva',
        },
        ...companionPassengers.map((cp, idx) => ({
          firstName: cp.firstName.trim(),
          lastName: cp.lastName.trim(),
          documentType: cp.documentType || 'cedula',
          documentNumber: cp.documentNumber?.trim() || undefined,
          phone: cp.phone?.trim() || undefined,
          isMainContact: false,
          notes: `Acompañante #${idx + 2}`,
        })),
      ];

      // 4. Create booking via BookingCreateService (handles code generation, capacity check & lock, booking insert, passenger insert, departure slots update)
      const bookingId = crypto.randomUUID();
      const booking = await bookingContainer.createService.execute(
        CreateBookingCommand.fromInput({
          id: bookingId,
          departureId: dep.id,
          customerId: customer.id,
          slotsReserved: data.slotsCount,
          totalAmount,
          paidAmount: '0.00',
          notes: data.notes || 'Reserva online autoservicio desde el catálogo web.',
          source: 'portal',
          passengers: allPassengers,
        }),
      );

      createdBookingId = booking.id;
      createdBookingCode = booking.code;

      // 5. Create payment via PaymentCreateService (handles atomic payment code generation and insert)
      await paymentContainer.createService.execute(
        CreatePaymentCommand.fromInput({
          id: crypto.randomUUID(),
          bookingId: booking.id,
          method: data.paymentMethod,
          amount: totalAmount,
          currency: 'USD',
          reference: effectiveReference,
          proofImageUrl: uploadedProofUrl,
          paymentDate: effectivePaymentDate,
          receivedByName: isCash
            ? 'Pago en efectivo acordado en checkout web'
            : 'Reportado por cliente en checkout web',
          notes: isCash
            ? 'Pago en efectivo directo acordado durante la reserva online.'
            : 'Comprobante y referencia ingresados durante el autoservicio online.',
          status: 'pending',
        }),
      );
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
