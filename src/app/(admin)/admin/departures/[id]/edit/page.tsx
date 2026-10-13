import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDepartureContainer } from '@/modules/departure/container';
import { createTourContainer } from '@/modules/tour/container';
import { DepartureForm } from '@/modules/departure/ui/DepartureForm';
import type { TourRow } from '@/modules/tour/models/tour.model';
import { CalendarDays } from 'lucide-react';
import { z } from 'zod';
import { DepartureNotFoundException } from '@/modules/departure/exceptions/departure-not-found.exception';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDeparturePage({ params }: PageProps) {
  const { id } = await params;
  await guardPage('departures.update');

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const departureContainer = createDepartureContainer();
  const tourContainer = createTourContainer();

  let departure;
  try {
    departure = await departureContainer.findService.executeOrFail(id);
  } catch (error) {
    if (error instanceof DepartureNotFoundException) {
      notFound();
    }
    throw error;
  }

  const rawTours: TourRow[] = await tourContainer.repository.getActive();
  const tours = rawTours.map((t: TourRow) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    durationDays: t.durationDays,
    basePrice: t.basePrice,
    currency: t.currency,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
            Editar Salida: {departure.code}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Actualice las fechas, punto de encuentro, precio especial o notas de la salida programada.
        </p>
      </div>

      <DepartureForm initialData={departure} tours={tours} />
    </div>
  );
}
