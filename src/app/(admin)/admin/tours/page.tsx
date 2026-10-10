import Link from 'next/link';
import { guardPage, hasPermission } from '@/modules/shared/auth/require-permission';
import { createTourContainer } from '@/modules/tour/container';
import { SearchTourCommand } from '@/modules/tour/commands/search-tour.command';
import { tourRoutes } from '@/modules/tour/routes';
import { TourStatusBadge } from '@/modules/tour/ui/TourStatusBadge';
import { TourStatusToggle } from '@/modules/tour/ui/TourStatusToggle';
import { Compass, Plus, Search, Eye, Edit3, Clock, DollarSign } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function ToursListPage({ searchParams }: PageProps) {
  await guardPage('tours.list');

  const [canCreate, canUpdate, canUpdateStatus] = await Promise.all([
    hasPermission('tours.create'),
    hasPermission('tours.update'),
    hasPermission('tours.update-status'),
  ]);

  const params = await searchParams;
  const q = params.q || undefined;
  const status = (params.status === 'draft' || params.status === 'active' || params.status === 'inactive') ? params.status : undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createTourContainer();
  const command = new SearchTourCommand({ q, status }, limit, offset);
  const { data: tours, total } = await container.searchService.execute(command);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tours y Paquetes Turísticos</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Diseño de experiencias turísticas, itinerarios multidía y fijación de tarifas ({total} registrados).
          </p>
        </div>

        {canCreate && (
          <Link
            href={tourRoutes.create()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo Tour
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, código o slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/tours"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !status ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todos
          </Link>
          <Link
            href="/admin/tours?status=active"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'active' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Activos
          </Link>
          <Link
            href="/admin/tours?status=draft"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'draft' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Borradores
          </Link>
          <Link
            href="/admin/tours?status=inactive"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'inactive' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Inactivos
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
                <th className="py-3.5 px-4">Nombre del Tour</th>
                <th className="py-3.5 px-4">Duración</th>
                <th className="py-3.5 px-4">Precio Base</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No se encontraron tours registrados.
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-700 text-xs">
                      {tour.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link href={tourRoutes.show(tour.id)} className="hover:text-teal-600 transition">
                        {tour.name}
                      </Link>
                      {tour.shortDescription && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{tour.shortDescription}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {tour.durationDays} {tour.durationDays === 1 ? 'día' : 'días'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-teal-600" />
                        {Number(tour.basePrice).toFixed(2)} {tour.currency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <TourStatusBadge status={tour.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdateStatus && <TourStatusToggle id={tour.id} currentStatus={tour.status} />}
                        <Link
                          href={tourRoutes.show(tour.id)}
                          title="Ver detalle e itinerario"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canUpdate && (
                          <Link
                            href={tourRoutes.edit(tour.id)}
                            title="Editar"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        )}
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
                  href={`/admin/tours?page=${page - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-white"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/tours?page=${page + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
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
