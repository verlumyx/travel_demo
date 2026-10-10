import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createDestinationContainer } from '@/modules/destination/container';
import { createCategoryContainer } from '@/modules/category/container';
import { destinationRoutes } from '@/modules/destination/routes';
import { DestinationStatusBadge } from '@/modules/destination/ui/DestinationStatusBadge';
import { DestinationStatusToggle } from '@/modules/destination/ui/DestinationStatusToggle';
import { RichTextView } from '@/components/ui/rich-text-view';
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
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Destinos
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{destination.name}</h1>
            <DestinationStatusBadge status={destination.status} />
          </div>
          <p className="text-sm font-mono text-teal-700 mt-1">Código: {destination.code}</p>
        </div>

        <div className="flex items-center gap-3">
          <DestinationStatusToggle id={destination.id} currentStatus={destination.status} />
          <Link
            href={destinationRoutes.edit(destination.id)}
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
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Categoría Turística</span>
            <p className="text-sm text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-amber-500" />
              {categoryName ? (
                <Link
                  href={`/admin/categories/${destination.categoryId}`}
                  className="hover:text-teal-600 font-medium transition"
                >
                  {categoryName}
                </Link>
              ) : (
                'Sin categoría asignada'
              )}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Ubicación</span>
            <p className="text-sm text-slate-800 mt-0.5">
              {[destination.city, destination.state, destination.country].filter(Boolean).join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Slug de URL</span>
            <p className="text-sm font-mono text-slate-600 mt-0.5">/{destination.slug}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Descripción</span>
            <RichTextView
              content={destination.description}
              fallback="Sin descripción detallada."
              className="text-sm text-slate-600 mt-0.5 leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha de Registro</span>
            <p className="text-sm text-slate-700 mt-0.5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              {new Date(destination.createdAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
            </p>
          </div>

          {destination.imageUrl && (
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Imagen de Portada</span>
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-56">
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
            <Compass className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Tours que visitan este destino</h2>
          </div>
          <span className="text-xs text-slate-500">{stops.length} apariciones en itinerarios</span>
        </div>

        {stops.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center text-slate-500 text-sm">
            Ningún tour tiene asignada una parada en este destino todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stops.map((stop) => (
              <Link
                key={stop.stopId}
                href={`/admin/tours/${stop.tourId}`}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-slate-50/70 shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-teal-700 font-semibold">{stop.tourCode}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Día {stop.dayNumber}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition mt-2">
                  {stop.tourName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{stop.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
