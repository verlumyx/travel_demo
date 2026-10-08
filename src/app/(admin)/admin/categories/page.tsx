import Link from 'next/link';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCategoryContainer } from '@/modules/category/container';
import { SearchCategoryCommand } from '@/modules/category/commands/search-category.command';
import { toCategoryDto } from '@/modules/category/serializers/category.serializer';
import { categoryRoutes } from '@/modules/category/routes';
import { CategoryStatusBadge } from '@/modules/category/ui/CategoryStatusBadge';
import { CategoryStatusToggle } from '@/modules/category/ui/CategoryStatusToggle';
import { Tag, Plus, Search, Eye, Edit3 } from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function CategoriesListPage({ searchParams }: PageProps) {
  await guardPage('categories.list');

  const params = await searchParams;
  const q = params.q || undefined;
  const status = (params.status === 'active' || params.status === 'inactive') ? params.status : undefined;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 15;
  const offset = (page - 1) * limit;

  const container = createCategoryContainer();
  const command = new SearchCategoryCommand({ q, status }, limit, offset);
  const { data: rows, total } = await container.searchService.execute(command);
  const categories = rows.map(toCategoryDto);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Categorías Turísticas</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestiona las etiquetas geográficas y temáticas para clasificar destinos ({total} registradas).
          </p>
        </div>

        <Link
          href={categoryRoutes.create()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, código o slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/categories"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !status ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </Link>
          <Link
            href="/admin/categories?status=active"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'active' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Activas
          </Link>
          <Link
            href="/admin/categories?status=inactive"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              status === 'inactive' ? 'bg-slate-800 text-rose-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inactivas
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-950/50">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Icono</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No se encontraron categorías registradas.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-amber-400 text-xs">
                      {cat.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <Link href={categoryRoutes.show(cat.id)} className="hover:text-indigo-400 transition">
                        {cat.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      /{cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {cat.icon || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <CategoryStatusBadge status={cat.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CategoryStatusToggle id={cat.id} currentStatus={cat.status} />
                        <Link
                          href={categoryRoutes.show(cat.id)}
                          title="Ver detalle"
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={categoryRoutes.edit(cat.id)}
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
                  href={`/admin/categories?page=${page - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-white"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/categories?page=${page + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
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
