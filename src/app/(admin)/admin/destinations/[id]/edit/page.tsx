import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDestinationContainer } from '@/modules/destination/container';
import { createCategoryContainer } from '@/modules/category/container';
import { DestinationForm } from '@/modules/destination/ui/DestinationForm';
import { MapPin } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDestinationPage({ params }: PageProps) {
  await guardPage('destinations.update');
  const { id } = await params;

  const destContainer = createDestinationContainer();
  const catContainer = createCategoryContainer();

  let destination;
  try {
    destination = await destContainer.findService.execute(id);
  } catch {
    notFound();
  }

  const categories = await catContainer.findService.getActive();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Destino: {destination.name}</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Actualiza los datos, categoría o ubicación del destino ({destination.code}).
        </p>
      </div>

      <DestinationForm destination={destination} categories={categories} />
    </div>
  );
}
