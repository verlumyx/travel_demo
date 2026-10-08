import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDepartureContainer } from '@/modules/departure/container';
import { createTourContainer } from '@/modules/tour/container';
import { DepartureForm } from '@/modules/departure/ui/DepartureForm';
import type { TourRow } from '@/modules/tour/models/tour.model';
import { CalendarDays } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDeparturePage({ params }: PageProps) {
  await guardPage('departures.update');
  const { id } = await params;

  const departureContainer = createDepartureContainer();
  const tourContainer = createTourContainer();

  let departure;
  try {
    departure = await departureContainer.findService.executeOrFail(id);
  } catch {
    notFound();
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
