import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createTransportUnitContainer } from '@/modules/transport-unit/container';
import { toTransportUnitDto } from '@/modules/transport-unit/serializers/transport-unit.serializer';
import { TransportUnitForm } from '@/modules/transport-unit/ui/TransportUnitForm';
import { Bus } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransportUnitPage({ params }: PageProps) {
  await guardPage('transport-units.update');
  const { id } = await params;

  const container = createTransportUnitContainer();
  let unit;
  try {
    const row = await container.findService.execute(id);
    unit = toTransportUnitDto(row);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Editar Unidad: {unit.name}</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Actualiza la capacidad, placa o chofer asignado a esta unidad ({unit.code}).
        </p>
      </div>

      <TransportUnitForm unit={unit} />
    </div>
  );
}
