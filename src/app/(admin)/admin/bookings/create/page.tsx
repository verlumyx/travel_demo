import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCustomerContainer } from '@/modules/customer/container';
import { createDepartureContainer } from '@/modules/departure/container';
import { BookingForm } from '@/modules/booking/ui/BookingForm';
import { Ticket } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    departureId?: string;
    customerId?: string;
  }>;
}

export default async function CreateBookingPage({ searchParams }: PageProps) {
  await guardPage('bookings.create');
  const params = await searchParams;

  const customerContainer = createCustomerContainer();
  const departureContainer = createDepartureContainer();
  const [rawCustomers, rawDepartures] = await Promise.all([
    customerContainer.repository.getActive(),
    departureContainer.repository.getActiveScheduled(),
  ]);

  const customerOptions = rawCustomers.map((c) => ({
    id: c.id,
    code: c.code,
    fullName: `${c.firstName} ${c.lastName}`.trim(),
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    documentType: c.documentType,
    documentNumber: c.documentNumber,
  }));

  const departureOptions = rawDepartures.map((d) => {
    const availableSlots = Math.max(0, d.totalCapacity - d.bookedSlots);
    const unitPrice = d.priceOverride || d.tourBasePrice;

    return {
      id: d.id,
      code: d.code,
      departureDate: d.departureDate.toISOString(),
      totalCapacity: d.totalCapacity,
      bookedSlots: d.bookedSlots,
      availableSlots,
      unitPrice: String(unitPrice),
      tourName: d.tourName,
      tourCode: d.tourCode,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Emitir Nueva Reserva
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Asigne los cupos deseados a una salida con aforo disponible y registre los pasajeros individuales.
        </p>
      </div>

      <BookingForm
        departures={departureOptions}
        customers={customerOptions}
        preselectedDepartureId={params.departureId}
        preselectedCustomerId={params.customerId}
      />
    </div>
  );
}
