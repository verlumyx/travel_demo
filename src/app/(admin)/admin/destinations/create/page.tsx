import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCategoryContainer } from '@/modules/category/container';
import { DestinationForm } from '@/modules/destination/ui/DestinationForm';
import { MapPin } from 'lucide-react';

export const instant = false;

export default async function CreateDestinationPage() {
  await guardPage('destinations.create');

  const catContainer = createCategoryContainer();
  const categories = await catContainer.findService.getActive();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Nuevo Destino Turístico</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Registra un nuevo atractivo o punto geográfico con su categoría temática y detalles de ubicación.
        </p>
      </div>

      <DestinationForm categories={categories} />
    </div>
  );
}
