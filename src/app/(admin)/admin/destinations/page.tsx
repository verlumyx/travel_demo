import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDestinationContainer } from '@/modules/destination/container';
import { createCategoryContainer } from '@/modules/category/container';
import { SearchDestinationCommand } from '@/modules/destination/commands/search-destination.command';
import { destinationRoutes } from '@/modules/destination/routes';
import { DestinationStatusBadge } from '@/modules/destination/ui/DestinationStatusBadge';
import { DestinationStatusToggle } from '@/modules/destination/ui/DestinationStatusToggle';
import { MapPin, Plus, Search, Eye, Edit3, Tag } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string; page?: string }>;
}

export default async function DestinationsListPage({ searchParams }: PageProps) {
  await guardPage('destinations.list');

  const params = await searchParams;
  const q = params.q || undefined;
  const status = (params.status === 'active' || params.status === 'inactive') ? params.status : undefined;
  const categoryId = params.categoryId || undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const destContainer = createDestinationContainer();
  const catContainer = createCategoryContainer();

  const [categories, { data: destinations, total }] = await Promise.all([
    catContainer.findService.getActive(),
    destContainer.searchService.execute(
      new SearchDestinationCommand({ q, status, categoryId }, limit, offset),
    ),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Destinos Turísticos</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Catálogo de lugares y atractivos disponibles para armar itinerarios y tours ({total} registrados).
          </p>
        </div>

        <Link
          href={destinationRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Destino
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar destino, estado, ciudad..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <Link
              href={`/admin/destinations${status ? `?status=${status}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                !categoryId ? 'bg-teal-50 text-teal-700 border border-teal-200 font-semibold' : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              Todas las Categorías
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/admin/destinations?categoryId=${c.id}${status ? `&status=${status}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  categoryId === c.id ? 'bg-teal-50 text-teal-700 border border-teal-200 font-semibold' : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/destinations${categoryId ? `?categoryId=${categoryId}` : ''}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                !status ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Todos
            </Link>
            <Link
              href={`/admin/destinations?status=active${categoryId ? `&categoryId=${categoryId}` : ''}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                status === 'active' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Activos
            </Link>
            <Link
              href={`/admin/destinations?status=inactive${categoryId ? `&categoryId=${categoryId}` : ''}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                status === 'inactive' ? 'bg-teal-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Inactivos
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 bg-slate-50/70">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Destino</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Ubicación</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {destinations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No se encontraron destinos turísticos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-700 text-xs">
                      {dest.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link href={destinationRoutes.show(dest.id)} className="hover:text-teal-600 transition">
                        {dest.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      {dest.categoryId && categoryMap.get(dest.categoryId) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs bg-amber-50 text-amber-700 border border-amber-200">
                          <Tag className="h-3 w-3" />
                          {categoryMap.get(dest.categoryId)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin categoría</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {[dest.city, dest.state, dest.country].filter(Boolean).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <DestinationStatusBadge status={dest.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DestinationStatusToggle id={dest.id} currentStatus={dest.status} />
                        <Link
                          href={destinationRoutes.show(dest.id)}
                          title="Ver detalle"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={destinationRoutes.edit(dest.id)}
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
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>Página {page} de {totalPages}</span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/destinations?page=${page - 1}${q ? `&q=${q}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/destinations?page=${page + 1}${q ? `&q=${q}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
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
