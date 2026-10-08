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
            <MapPin className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Destinos Turísticos</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Catálogo de lugares y atractivos disponibles para armar itinerarios y tours ({total} registrados).
          </p>
        </div>

        <Link
          href={destinationRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Destino
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar destino, estado, ciudad..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <Link
              href={`/admin/destinations${status ? `?status=${status}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                !categoryId ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Todas las Categorías
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/admin/destinations?categoryId=${c.id}${status ? `&status=${status}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  categoryId === c.id ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/destinations${categoryId ? `?categoryId=${categoryId}` : ''}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                !status ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </Link>
            <Link
              href={`/admin/destinations?status=active${categoryId ? `&categoryId=${categoryId}` : ''}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                status === 'active' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos
            </Link>
            <Link
              href={`/admin/destinations?status=inactive${categoryId ? `&categoryId=${categoryId}` : ''}`}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                status === 'inactive' ? 'bg-slate-800 text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inactivos
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-950/50">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Destino</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Ubicación</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {destinations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No se encontraron destinos turísticos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-cyan-400 text-xs">
                      {dest.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <Link href={destinationRoutes.show(dest.id)} className="hover:text-cyan-400 transition">
                        {dest.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      {dest.categoryId && categoryMap.get(dest.categoryId) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs bg-slate-800 text-amber-300 border border-slate-700">
                          <Tag className="h-3 w-3" />
                          {categoryMap.get(dest.categoryId)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Sin categoría</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
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
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={destinationRoutes.edit(dest.id)}
                          title="Editar"
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
                  href={`/admin/destinations?page=${page - 1}${q ? `&q=${q}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-white"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/destinations?page=${page + 1}${q ? `&q=${q}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}${status ? `&status=${status}` : ''}`}
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
