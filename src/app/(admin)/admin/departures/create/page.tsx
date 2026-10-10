import { guardPage } from '@/modules/shared/auth/require-permission';
import { createTourContainer } from '@/modules/tour/container';
import { DepartureForm } from '@/modules/departure/ui/DepartureForm';
import type { TourRow } from '@/modules/tour/models/tour.model';
import { CalendarDays } from 'lucide-react';

export const instant = false;

export default async function CreateDeparturePage() {
  await guardPage('departures.create');

  const tourContainer = createTourContainer();
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Programar Nueva Salida
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Defina la fecha, hora y tour base. Luego de crearla podrá asignar las unidades de transporte para conformar el aforo.
        </p>
      </div>

      <DepartureForm key="create-departure" tours={tours} />
    </div>
  );
}
