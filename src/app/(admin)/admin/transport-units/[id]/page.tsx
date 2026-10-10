import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createTransportUnitContainer } from '@/modules/transport-unit/container';
import { transportUnitRoutes } from '@/modules/transport-unit/routes';
import { TransportUnitStatusBadge } from '@/modules/transport-unit/ui/TransportUnitStatusBadge';
import { TransportUnitStatusToggle } from '@/modules/transport-unit/ui/TransportUnitStatusToggle';
import { RichTextView } from '@/components/ui/rich-text-view';
import { ArrowLeft, Edit3, Bus, Users, Phone, UserCheck, Calendar, Shield } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransportUnitDetailPage({ params }: PageProps) {
  await guardPage('transport-units.read');
  const { id } = await params;

  const container = createTransportUnitContainer();
  let unit;
  try {
    unit = await container.findService.execute(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={transportUnitRoutes.list()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Unidades
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{unit.name}</h1>
            <TransportUnitStatusBadge status={unit.status} />
          </div>
          <p className="text-sm font-mono text-teal-700 mt-1">Código: {unit.code}</p>
        </div>

        <div className="flex items-center gap-3">
          <TransportUnitStatusToggle id={unit.id} currentStatus={unit.status} />
          <Link
            href={transportUnitRoutes.edit(unit.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 shadow-sm transition"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Details Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Tipo de Vehículo</span>
            <p className="text-sm text-slate-800 mt-0.5 capitalize flex items-center gap-1.5">
              <Bus className="h-4 w-4 text-teal-600" />
              {unit.type}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Capacidad Máxima</span>
            <p className="text-sm text-slate-800 mt-0.5 flex items-center gap-1.5 font-medium">
              <Users className="h-4 w-4 text-slate-400" />
              {unit.capacity} pasajeros sentados
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Placa / Matrícula</span>
            <p className="text-sm font-mono text-slate-700 mt-0.5">
              {unit.plateNumber || 'No especificada'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Observaciones Técnicas</span>
            <RichTextView
              content={unit.notes}
              fallback="Sin observaciones adicionales."
              className="text-sm text-slate-600 mt-0.5 leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Conductor Asignado</span>
            <p className="text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-teal-600" />
              {unit.driverName || 'Sin conductor asignado fijo'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Teléfono de Contacto</span>
            <p className="text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-teal-600" />
              {unit.driverPhone || 'Sin teléfono registrado'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha de Registro</span>
            <p className="text-sm text-slate-700 mt-0.5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              {new Date(unit.createdAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
