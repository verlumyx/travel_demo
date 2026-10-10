import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createTourContainer } from '@/modules/tour/container';
import { TourForm } from '@/modules/tour/ui/TourForm';
import { Compass } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTourPage({ params }: PageProps) {
  await guardPage('tours.update');
  const { id } = await params;

  const container = createTourContainer();
  let tour;
  try {
    tour = await container.findService.execute(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Tour: {tour.name}</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Modifica las tarifas, descripción, duraciones o detalles del paquete ({tour.code}).
        </p>
      </div>

      <TourForm tour={tour} />
    </div>
  );
}
