import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createTourContainer } from '@/modules/tour/container';
import { createDestinationContainer } from '@/modules/destination/container';
import type { DestinationDto } from '@/modules/destination/serializers/destination.serializer';
import { createItineraryStopContainer } from '@/modules/itinerary-stop/container';
import type { ItineraryStopRow } from '@/modules/itinerary-stop/models/itinerary-stop.model';
import { tourRoutes } from '@/modules/tour/routes';
import { TourStatusBadge } from '@/modules/tour/ui/TourStatusBadge';
import { TourStatusToggle } from '@/modules/tour/ui/TourStatusToggle';
import { ItineraryStopForm } from '@/modules/itinerary-stop/ui/ItineraryStopForm';
import {
  ArrowLeft,
  Edit3,
  Compass,
  Clock,
  DollarSign,
  Utensils,
  Hotel,
  MapPin,
  Check,
  X,
  Moon,
  Calendar,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TourDetailPage({ params }: PageProps) {
  await guardPage('tours.read');
  const { id } = await params;

  const tourContainer = createTourContainer();
  const destContainer = createDestinationContainer();
  const stopContainer = createItineraryStopContainer();

  let tour;
  try {
    tour = await tourContainer.findService.execute(id);
  } catch {
    notFound();
  }

  // Fetch stops for this tour and all active destinations for the stop form
  const [stops, activeDestinations] = await Promise.all([
    stopContainer.findService.findByTourId(id),
    destContainer.findService.getActive(),
  ]);

  const destinationMap = new Map<string, DestinationDto>(activeDestinations.map((d) => [d.id, d]));

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={tourRoutes.list()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Tours
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{tour.name}</h1>
            <TourStatusBadge status={tour.status} />
          </div>
          <p className="text-sm font-mono text-emerald-400 mt-1">Código: {tour.code}</p>
        </div>

        <div className="flex items-center gap-3">
          <TourStatusToggle id={tour.id} currentStatus={tour.status} />
          <Link
            href={tourRoutes.edit(tour.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition"
          >
            <Edit3 className="h-4 w-4" />
            Editar Tour
          </Link>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-slate-800 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>
                  <strong>{tour.durationDays}</strong> {tour.durationDays === 1 ? 'día' : 'días'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span>
                  Tarifa: <strong>{Number(tour.basePrice).toFixed(2)} {tour.currency}</strong> / persona
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                {tour.includesFood ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Utensils className="h-3.5 w-3.5" /> Comida incluida
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Utensils className="h-3.5 w-3.5" /> Sin comida
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                {tour.includesLodging ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Hotel className="h-3.5 w-3.5" /> Hospedaje incluido
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Hotel className="h-3.5 w-3.5" /> Sin hospedaje
                  </span>
                )}
              </div>
            </div>

            {tour.shortDescription && (
              <p className="text-sm font-medium text-slate-200">{tour.shortDescription}</p>
            )}

            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">Descripción del Tour</span>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {tour.description || 'Sin descripción detallada.'}
              </p>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Incluye
                </span>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {tour.inclusions || 'No especificadas'}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> No Incluye
                </span>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {tour.exclusions || 'No especificadas'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cover image & metadata */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="text-xs font-medium uppercase text-slate-500">Imagen de Portada</span>
            {tour.imageUrl ? (
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tour.imageUrl}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Sin imagen asignada
              </div>
            )}

            <div className="text-xs text-slate-400 space-y-1 pt-2">
              <p>Slug: <span className="font-mono text-slate-300">/{tour.slug}</span></p>
              <p>Creado: <span className="text-slate-300">{new Date(tour.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Manager Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Itinerario y Paradas</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ruta cronológica de atractivos turísticos programados a lo largo de los {tour.durationDays} días de viaje.
            </p>
          </div>

          <ItineraryStopForm
            tourId={tour.id}
            destinations={activeDestinations}
            defaultDayNumber={stops.length > 0 ? stops[stops.length - 1].dayNumber : 1}
          />
        </div>

        {stops.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-slate-500 text-sm">
            Este tour aún no cuenta con paradas registradas en su itinerario. Agrega la primera parada usando el botón superior.
          </div>
        ) : (
          <div className="space-y-4">
            {stops.map((stop, index) => {
              const dest = destinationMap.get(stop.destinationId);
              return (
                <div
                  key={stop.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">
                      <span>Día</span>
                      <span>{stop.dayNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{stop.title}</span>
                        {stop.overnightStay && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            <Moon className="h-3 w-3" /> Pernocta
                          </span>
                        )}
                      </div>

                      {dest && (
                        <Link
                          href={`/admin/destinations/${dest.id}`}
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-0.5"
                        >
                          <MapPin className="h-3 w-3" />
                          {dest.name} ({dest.code})
                        </Link>
                      )}

                      {stop.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {stop.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500 self-end sm:self-center">
                    Paso #{stop.sortOrder}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
