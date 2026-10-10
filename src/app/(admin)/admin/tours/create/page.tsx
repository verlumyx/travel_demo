import { guardPage } from '@/modules/shared/auth/require-permission';
import { TourForm } from '@/modules/tour/ui/TourForm';
import { Compass } from 'lucide-react';

export const instant = false;

export default async function CreateTourPage() {
  await guardPage('tours.create');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nuevo Tour / Paquete Turístico</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Crea una nueva propuesta de experiencia turística con tarifa base, duración e inclusiones.
        </p>
      </div>

      <TourForm key="create-tour" />
    </div>
  );
}
