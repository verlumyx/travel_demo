import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createBookingContainer } from '@/modules/booking/container';
import { bookingRoutes } from '@/modules/booking/routes';
import { toBookingDto } from '@/modules/booking/serializers/booking.serializer';
import { BookingEditForm } from '@/modules/booking/ui/BookingEditForm';
import { ArrowLeft } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingEditPage({ params }: PageProps) {
  await guardPage('bookings.update');
  const { id } = await params;

  const bookingContainer = createBookingContainer();
  let details;
  try {
    details = await bookingContainer.findService.findOrFailWithDetails(id);
  } catch {
    notFound();
  }

  const { booking: rawBooking, customer: rawCustomer, departure: rawDeparture, tour } = details;

  const booking = toBookingDto({
    ...rawBooking,
    customerName: `${rawCustomer.firstName} ${rawCustomer.lastName}`.trim(),
    customerCode: rawCustomer.code,
    departureDate: rawDeparture.departureDate,
    departureCode: rawDeparture.code,
    tourName: tour.name,
    tourCode: tour.code,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={bookingRoutes.show(booking.id)}
          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Editar Reserva <span className="font-mono text-primary">{booking.code}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modifique las notas y observaciones operativas del viaje.
          </p>
        </div>
      </div>

      <BookingEditForm booking={booking} />
    </div>
  );
}
