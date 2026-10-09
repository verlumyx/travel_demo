import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDestinationContainer } from '@/modules/destination/container';
import { createCategoryContainer } from '@/modules/category/container';
import { destinationRoutes } from '@/modules/destination/routes';
import { DestinationStatusBadge } from '@/modules/destination/ui/DestinationStatusBadge';
import { DestinationStatusToggle } from '@/modules/destination/ui/DestinationStatusToggle';
import { createItineraryStopContainer } from '@/modules/itinerary-stop/container';
import { ArrowLeft, Edit3, MapPin, Tag, Calendar, Globe, Compass } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DestinationDetailPage({ params }: PageProps) {
  await guardPage('destinations.read');
  const { id } = await params;

  const destContainer = createDestinationContainer();
  let destination;
  try {
    destination = await destContainer.findService.execute(id);
  } catch {
    notFound();
  }

  // Find category details
  let categoryName: string | null = null;
  if (destination.categoryId) {
    try {
      const catContainer = createCategoryContainer();
      const cat = await catContainer.findService.execute(destination.categoryId);
      categoryName = cat.name;
    } catch {
      // ignore
    }
  }

  // Find tours that visit this destination via itinerary stops
  const stopContainer = createItineraryStopContainer();
  const stops = await stopContainer.repository.findByDestinationIdWithTour(id);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={destinationRoutes.list()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Destinos
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{destination.name}</h1>
            <DestinationStatusBadge status={destination.status} />
          </div>
          <p className="text-sm font-mono text-cyan-400 mt-1">Código: {destination.code}</p>
        </div>

        <div className="flex items-center gap-3">
          <DestinationStatusToggle id={destination.id} currentStatus={destination.status} />
          <Link
            href={destinationRoutes.edit(destination.id)}
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
            <span className="text-xs font-medium uppercase text-slate-500">Categoría Turística</span>
            <p className="text-sm text-slate-200 mt-0.5 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-amber-400" />
              {categoryName ? (
                <Link
                  href={`/admin/categories/${destination.categoryId}`}
                  className="hover:text-indigo-400 font-medium transition"
                >
                  {categoryName}
                </Link>
              ) : (
                'Sin categoría asignada'
              )}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Ubicación</span>
            <p className="text-sm text-slate-200 mt-0.5">
              {[destination.city, destination.state, destination.country].filter(Boolean).join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Slug de URL</span>
            <p className="text-sm font-mono text-slate-400 mt-0.5">/{destination.slug}</p>
          </div>

          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Descripción</span>
            <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">
              {destination.description || 'Sin descripción detallada.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Fecha de Registro</span>
            <p className="text-sm text-slate-300 mt-0.5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              {new Date(destination.createdAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
            </p>
          </div>

          {destination.imageUrl && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Imagen de Portada</span>
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked Tours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Tours que visitan este destino</h2>
          </div>
          <span className="text-xs text-slate-500">{stops.length} apariciones en itinerarios</span>
        </div>

        {stops.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-sm">
            Ningún tour tiene asignada una parada en este destino todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stops.map((stop) => (
              <Link
                key={stop.stopId}
                href={`/admin/tours/${stop.tourId}`}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400">{stop.tourCode}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    Día {stop.dayNumber}
                  </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition mt-2">
                  {stop.tourName}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{stop.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
