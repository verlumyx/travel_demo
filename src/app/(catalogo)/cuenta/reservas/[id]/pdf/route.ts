import { NextResponse, type NextRequest } from 'next/server';
import { requireCustomerSession } from '@/modules/customer/auth/customer-session';
import { createBookingContainer } from '@/modules/booking/container';
import { generateVoucherPdf } from '@/modules/booking/pdf/voucher-pdf.generator';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireCustomerSession();
    const { id } = await params;

    const bookingContainer = createBookingContainer();
    const details = await bookingContainer.findService.findOrFailWithDetails(id);

    // Security guard: Asegurar que la reserva pertenece estrictamente al cliente autenticado
    if (details.customer.id !== session.customer.id) {
      return new NextResponse('No autorizado', { status: 403 });
    }

    const {
      booking,
      customer,
      departure,
      tour,
      passengers,
    } = details;

    const doc = await generateVoucherPdf({
      booking: {
        id: booking.id,
        code: booking.code,
        status: booking.status,
        slotsReserved: booking.slotsReserved,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        notes: booking.notes,
        createdAt: booking.createdAt,
      },
      tour: {
        id: tour.id,
        name: tour.name,
        code: tour.code,
      },
      departure: {
        id: departure.id,
        code: departure.code,
        departureDate: departure.departureDate,
        meetingPoint: departure.meetingPoint,
        meetingTime: departure.meetingTime,
      },
      customer: {
        id: customer.id,
        code: customer.code,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        documentType: customer.documentType,
        documentNumber: customer.documentNumber,
        emergencyContact: customer.emergencyContact,
        emergencyPhone: customer.emergencyPhone,
      },
      passengers: passengers.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        documentType: p.documentType,
        documentNumber: p.documentNumber,
        phone: p.phone,
        isMainContact: p.isMainContact,
        notes: p.notes,
      })),
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Voucher_${booking.code}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error generando voucher PDF de la reserva:', error);
    return new NextResponse('Reserva no encontrada o error interno', { status: 404 });
  }
}
