import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { app_tours } from '@/modules/tour/models/tour.model';
import { app_destinations } from '@/modules/destination/models/destination.model';
import { app_categories } from '@/modules/category/models/category.model';
import { itineraryStops } from '@/modules/itinerary-stop/models/itinerary-stop.model';
import { departures } from '@/modules/departure/models/departure.model';
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

  // 1. Fetch tour by slug
  const [tour] = await db
    .select()
    .from(app_tours)
    .where(and(eq(app_tours.slug, slug), eq(app_tours.status, 'active')))
    .limit(1);

  if (!tour) {
    notFound();
  }

  // 2. Fetch itinerary stops with destinations and categories
  const stops = await db
    .select({
      id: itineraryStops.id,
      dayNumber: itineraryStops.dayNumber,
      sortOrder: itineraryStops.sortOrder,
      title: itineraryStops.title,
      description: itineraryStops.description,
      overnightStay: itineraryStops.overnightStay,
      destinationName: app_destinations.name,
      destinationState: app_destinations.state,
      destinationCity: app_destinations.city,
      categoryName: app_categories.name,
    })
    .from(itineraryStops)
    .innerJoin(app_destinations, eq(itineraryStops.destinationId, app_destinations.id))
    .leftJoin(app_categories, eq(app_destinations.categoryId, app_categories.id))
    .where(eq(itineraryStops.tourId, tour.id))
    .orderBy(itineraryStops.dayNumber, itineraryStops.sortOrder);

  // 3. Fetch scheduled upcoming departures
  const upcomingDepartures = await db
    .select()
    .from(departures)
    .where(
      and(
        eq(departures.tourId, tour.id),
        eq(departures.status, 'scheduled'),
      ),
    )
    .orderBy(departures.departureDate);

  const primaryCategory = stops[0]?.categoryName;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Link href="/tours" className="hover:text-foreground transition flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Tours
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{tour.name}</span>
      </div>

      {/* Hero Tour Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Tour Highlights & Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                {tour.code}
              </span>
              {primaryCategory && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-muted text-foreground">
                  {primaryCategory}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-muted text-foreground">
                {tour.durationDays} {tour.durationDays === 1 ? 'Día' : 'Días'} de duración
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {tour.name}
            </h1>

            {tour.shortDescription && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {tour.shortDescription}
              </p>
            )}
          </div>

          {/* Cover Photo */}
          <div className="aspect-16/9 rounded-3xl overflow-hidden bg-slate-800 shadow-md">
            {tour.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tour.imageUrl}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-950 text-indigo-300">
                <Compass className="h-20 w-20 opacity-30" />
              </div>
            )}
          </div>

          {/* Description Section */}
          {tour.description && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-foreground">Acerca de esta Experiencia</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {tour.description}
              </div>
            </div>
          )}

          {/* Day by Day Itinerary */}
          {stops.length > 0 && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Itinerario Día por Día
              </h2>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
                {stops.map((stop, idx) => (
                  <div key={stop.id} className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                      {stop.dayNumber}
                    </div>

                    <div className="space-y-1.5 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          Día {stop.dayNumber}: {stop.title}
                        </span>
                        {stop.categoryName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {stop.categoryName}
                          </span>
                        )}
                        {stop.overnightStay && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            Pernocta en destino
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {stop.destinationName}
                        {stop.destinationState ? `, ${stop.destinationState}` : ''}
                      </div>

                      {stop.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                          {stop.description}
                        </p>
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
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ¿Qué incluye el paquete?
              </h3>

              <div className="space-y-2 text-xs text-muted-foreground">
                {tour.includesFood && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Alimentación completa o refrigerios programados
                  </div>
                )}
                {tour.includesLodging && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Hospedaje / Alojamiento en destino
                  </div>
                )}
                {tour.inclusions ? (
                  <p className="whitespace-pre-line leading-relaxed">{tour.inclusions}</p>
                ) : (
                  <p>Transporte ida y vuelta, guías calificados y atención en ruta.</p>
                )}
              </div>
            </div>

            {/* Exclusions */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500" />
                ¿Qué no incluye?
              </h3>

              <div className="space-y-2 text-xs text-muted-foreground">
                {tour.exclusions ? (
                  <p className="whitespace-pre-line leading-relaxed">{tour.exclusions}</p>
                ) : (
                  <p>Gastos personales, bebidas alcohólicas y propinas no especificadas.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Available Departures & Fast Booking Sidebar */}
        <div className="space-y-6 sticky top-20">
          {/* Pricing & Booking Card */}
          <div className="bg-card border-2 border-border hover:border-primary/50 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tarifa desde
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-foreground">
                  ${tour.basePrice}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {tour.currency} / persona
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Próximas Salidas Disponibles ({upcomingDepartures.length})
              </h3>

              {upcomingDepartures.length === 0 ? (
                <div className="p-5 text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl">
                  No hay salidas programadas abiertas en este momento para este tour. Consulta con nuestro equipo.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDepartures.map((dep) => {
                    const depDate = new Date(dep.departureDate);
                    const availableSlots = dep.totalCapacity - dep.bookedSlots;
                    const price = dep.priceOverride ? Number(dep.priceOverride) : Number(tour.basePrice);

                    return (
                      <div
                        key={dep.id}
                        className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-foreground text-sm block">
                              {depDate.toLocaleDateString('es-VE', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-[11px] text-muted-foreground block font-mono">
                              Código: {dep.code} • Salida: {depDate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold font-mono text-foreground text-sm block">
                              ${price.toFixed(2)} USD
                            </span>
                          </div>
                        </div>

                        {dep.meetingPoint && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate">{dep.meetingPoint}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          {availableSlots > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {availableSlots} cupos disponibles
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-500">
                              Agotado
                            </span>
                          )}

                          {availableSlots > 0 ? (
                            <Link
                              href={`/reservar/${dep.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition shadow-xs"
                            >
                              Reservar <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed opacity-60"
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
