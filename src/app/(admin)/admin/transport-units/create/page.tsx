import { guardPage } from '@/modules/shared/auth/require-permission';
import { TransportUnitForm } from '@/modules/transport-unit/ui/TransportUnitForm';
import { Bus } from 'lucide-react';

export const instant = false;

export default async function CreateTransportUnitPage() {
  await guardPage('transport-units.create');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nueva Unidad de Transporte</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Registra un nuevo vehículo (autobús, van, lancha) para el inventario de movilidad de la agencia.
        </p>
      </div>

      <TransportUnitForm />
    </div>
  );
}
