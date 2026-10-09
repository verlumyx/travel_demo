import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCategoryContainer } from '@/modules/category/container';
import { toCategoryDto } from '@/modules/category/serializers/category.serializer';
import { categoryRoutes } from '@/modules/category/routes';
import { CategoryStatusBadge } from '@/modules/category/ui/CategoryStatusBadge';
import { CategoryStatusToggle } from '@/modules/category/ui/CategoryStatusToggle';
import { createDestinationContainer } from '@/modules/destination/container';
import { toDestinationDto, type DestinationDto } from '@/modules/destination/serializers/destination.serializer';
import { ArrowLeft, Edit3, Tag, MapPin, Calendar, Globe } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  await guardPage('categories.read');
  const { id } = await params;

  const container = createCategoryContainer();
  const destContainer = createDestinationContainer();

  let category;
  try {
    const row = await container.findService.execute(id);
    category = toCategoryDto(row);
  } catch {
    notFound();
  }

  // Find destinations linked to this category
  const rawDestinations = await destContainer.repository.findByCategoryId(id);
  const linkedDestinations = rawDestinations.map(toDestinationDto);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={categoryRoutes.list()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Categorías
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{category.name}</h1>
            <CategoryStatusBadge status={category.status} />
          </div>
          <p className="text-sm font-mono text-amber-400 mt-1">Código: {category.code}</p>
        </div>

        <div className="flex items-center gap-3">
          <CategoryStatusToggle id={category.id} currentStatus={category.status} />
          <Link
            href={categoryRoutes.edit(category.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Details Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Slug de URL</span>
            <p className="text-sm font-mono text-slate-200 mt-0.5">/{category.slug}</p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Ícono</span>
            <p className="text-sm text-slate-200 mt-0.5">{category.icon || 'Sin ícono configurado'}</p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Descripción</span>
            <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">
              {category.description || 'Sin descripción detallada.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Fecha de Registro</span>
            <p className="text-sm text-slate-300 mt-0.5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              {new Date(category.createdAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
            </p>
          </div>

          {category.imageUrl && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Imagen de Portada</span>
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked Destinations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Destinos bajo esta Categoría</h2>
          </div>
          <span className="text-xs text-slate-500">{linkedDestinations.length} destinos</span>
        </div>

        {linkedDestinations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-sm">
            No hay destinos turísticos asociados a esta categoría todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {linkedDestinations.map((dest: DestinationDto) => (
              <Link
                key={dest.id}
                href={`/admin/destinations/${dest.id}`}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono text-cyan-400">{dest.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    dest.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {dest.status}
                  </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition mt-2">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {dest.state ? `${dest.state}, ` : ''}{dest.country}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
