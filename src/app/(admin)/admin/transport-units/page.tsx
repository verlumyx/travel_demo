import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createTransportUnitContainer } from '@/modules/transport-unit/container';
import { SearchTransportUnitCommand } from '@/modules/transport-unit/commands/search-transport-unit.command';
import { transportUnitRoutes } from '@/modules/transport-unit/routes';
import { TransportUnitStatusBadge } from '@/modules/transport-unit/ui/TransportUnitStatusBadge';
import { TransportUnitStatusToggle } from '@/modules/transport-unit/ui/TransportUnitStatusToggle';
import { Bus, Plus, Search, Eye, Edit3, Users } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>;
}

export default async function TransportUnitsListPage({ searchParams }: PageProps) {
  await guardPage('transport-units.list');

  const params = await searchParams;
  const q = params.q || undefined;
  const status = params.status || undefined;
  const type = params.type || undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createTransportUnitContainer();
  const command = SearchTransportUnitCommand.fromInput({ q, status, type, limit, offset });
  const { items: units, total } = await container.searchService.execute(command);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Flota de Transporte</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de vehículos y recursos de movilidad para asignación en salidas grupales ({total} unidades registradas).
          </p>
        </div>

        <Link
          href={transportUnitRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nueva Unidad
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, placa o chofer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/transport-units"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !status ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todas
          </Link>
          <Link
            href="/admin/transport-units?status=active"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'active' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Operativas
          </Link>
          <Link
            href="/admin/transport-units?status=maintenance"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'maintenance' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Mantenimiento
          </Link>
          <Link
            href="/admin/transport-units?status=inactive"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'inactive' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Inactivas
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 bg-slate-50/70">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Unidad</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Capacidad</th>
                <th className="py-3.5 px-4">Conductor</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {units.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron unidades de transporte registradas.
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-700 text-xs">
                      {unit.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link href={transportUnitRoutes.show(unit.id)} className="hover:text-teal-600 transition">
                        {unit.name}
                      </Link>
                      {unit.plateNumber && (
                        <span className="block text-[11px] font-mono text-slate-400">
                          Placa: {unit.plateNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 text-xs">
                      {unit.type}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {unit.capacity} pax
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {unit.driverName || '-'}
                      {unit.driverPhone && (
                        <span className="block text-[11px] text-slate-400">{unit.driverPhone}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <TransportUnitStatusBadge status={unit.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TransportUnitStatusToggle id={unit.id} currentStatus={unit.status} />
                        <Link
                          href={transportUnitRoutes.show(unit.id)}
                          title="Ver detalle"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={transportUnitRoutes.edit(unit.id)}
                          title="Editar"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Página {page} de {totalPages}</span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/transport-units?page=${page - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-white"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/transport-units?page=${page + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-white"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
