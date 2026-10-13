import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createTourContainer } from '@/modules/tour/container';
import { createItineraryStopContainer } from '@/modules/itinerary-stop/container';
import { createDepartureContainer } from '@/modules/departure/container';
import { RichTextView, isEmptyHtml } from '@/components/ui/rich-text-view';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Utensils,
  BedDouble,
  ShieldCheck,
  Users,
  Ticket,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const tourContainer = createTourContainer();
  const itineraryContainer = createItineraryStopContainer();
  const departureContainer = createDepartureContainer();

  // 1. Fetch tour by slug
  const tour = await tourContainer.repository.findBySlug(slug);
  if (!tour || tour.status !== 'active') {
    notFound();
  }

  // 2. Fetch itinerary stops with destinations and categories
  const stops = await itineraryContainer.repository.findByTourIdWithDetails(tour.id);

  // 3. Fetch scheduled upcoming departures
  const allDepartures = await departureContainer.repository.findByTourId(tour.id);
  const upcomingDepartures = allDepartures
    .filter((d) => d.status === 'scheduled')
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

  const primaryCategory = stops[0]?.categoryName;

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/tours" className="hover:text-slate-900 transition flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Tours
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-sm">{tour.name}</span>
      </div>

      {/* Hero Tour Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Tour Highlights & Description */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {primaryCategory && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                  {primaryCategory}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                {tour.durationDays} {tour.durationDays === 1 ? 'Día' : 'Días'} de duración
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {tour.name}
            </h1>

            {tour.shortDescription && (
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {tour.shortDescription}
              </p>
            )}
          </div>

          {/* Cover Photo */}
          <div className="aspect-16/9 rounded-3xl overflow-hidden bg-slate-900 shadow-md">
            {tour.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tour.imageUrl}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-teal-400">
                <Compass className="h-16 w-16 opacity-30" />
              </div>
            )}
          </div>

          {/* Description Section */}
          {!isEmptyHtml(tour.description) && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900">Acerca de esta Experiencia</h2>
              <RichTextView
                content={tour.description}
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
              />
            </div>
          )}

          {/* Day by Day Itinerary */}
          {stops.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-teal-700" />
                Itinerario Día por Día
              </h2>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {stops.map((stop) => (
                  <div key={stop.id} className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                      {stop.dayNumber}
                    </div>

                    <div className="space-y-1.5 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          Día {stop.dayNumber}: {stop.title}
                        </span>
                        {stop.categoryName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                            {stop.categoryName}
                          </span>
                        )}
                        {stop.overnightStay && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Pernocta en destino
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-teal-700" />
                        {stop.destinationName}
                        {stop.destinationState ? `, ${stop.destinationState}` : ''}
                      </div>

                      {!isEmptyHtml(stop.description) && (
                        <RichTextView
                          content={stop.description}
                          className="text-xs text-slate-600 leading-relaxed pt-1"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Qué incluye el paquete
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                {tour.includesFood && (
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Alimentación completa o refrigerios en ruta
                  </div>
                )}
                {tour.includesLodging && (
                  <div className="flex items-center gap-2 text-teal-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Hospedaje o posada en destino
                  </div>
                )}
                <RichTextView
                  content={tour.inclusions}
                  fallback="Transporte ida y vuelta, guías calificados y atención médica básica."
                  className="text-xs text-slate-600 leading-relaxed"
                />
              </div>
            </div>

            {/* Exclusions */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500" />
                Qué no incluye
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <RichTextView
                  content={tour.exclusions}
                  fallback="Gastos personales, bebidas alcohólicas y propinas de servicio."
                  className="text-xs text-slate-600 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Available Departures & Fast Booking Sidebar */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tarifa desde
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  ${tour.basePrice}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {tour.currency} / persona
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-700" />
                Salidas Programadas ({upcomingDepartures.length})
              </h3>

              {upcomingDepartures.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  No hay salidas programadas abiertas en este momento para este tour. Consulta con nuestro equipo.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDepartures.map((dep) => {
                    const depDate = new Date(dep.departureDate);
                    const availableSlots = dep.totalCapacity - dep.bookedSlots;
                    const price =
                      dep.priceOverride && Number(dep.priceOverride) > 0
                        ? Number(dep.priceOverride)
                        : Number(tour.basePrice);

                    return (
                      <div
                        key={dep.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {depDate.toLocaleDateString('es-VE', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Hora de salida: {depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold font-mono text-slate-900 text-sm block">
                              ${price.toFixed(2)} USD
                            </span>
                          </div>
                        </div>

                        {dep.meetingPoint && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-teal-700 shrink-0" />
                            <span className="truncate">{dep.meetingPoint}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          {availableSlots > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-700">
                              {availableSlots} cupos disponibles
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-600">
                              Agotado
                            </span>
                          )}

                          {availableSlots > 0 ? (
                            <Link
                              href={`/reservar/${dep.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 active:scale-[0.98] transition shadow-xs"
                            >
                              Reservar <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed opacity-60"
                            >
                              Sin cupos
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
