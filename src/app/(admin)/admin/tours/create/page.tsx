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
          <Compass className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Nuevo Tour / Paquete Turístico</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Crea una nueva propuesta de experiencia turística con tarifa base, duración e inclusiones.
        </p>
      </div>

      <TourForm />
    </div>
  );
}
