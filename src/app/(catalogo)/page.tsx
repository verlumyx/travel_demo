import { connection } from 'next/server';
import { createDestinationContainer } from '@/modules/destination/container';
import { createDepartureContainer } from '@/modules/departure/container';
import { SearchDestinationCommand } from '@/modules/destination/commands/search-destination.command';
import type { ScheduledDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import { stripHtml, isEmptyHtml } from '@/components/ui/rich-text-view';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';

export const instant = false;

export default async function HomePage() {
  await connection();

  const destContainer = createDestinationContainer();
  const departureContainer = createDepartureContainer();

  const [destinationsResult, upcomingDepartures] = await Promise.all([
    destContainer.searchService.execute(
      new SearchDestinationCommand({ status: 'active' }, 4, 0),
    ),
    departureContainer.upcomingService.execute(20),
  ]);

  const destinations = destinationsResult.data;

  // Group departures by date key (YYYY-MM-DD)
  const departuresByDay = upcomingDepartures.reduce<Record<string, ScheduledDepartureDto[]>>(
    (acc, dep) => {
      const dateKey = dep.departureDate.slice(0, 10);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(dep);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-20 pb-24">
      {/* Hero Section: Centered */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-[11px] font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            Expediciones Guiadas 2026
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
            Rutas extraordinarias por los destinos más salvajes de Venezuela.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Salidas grupales programadas, cupos garantizados por unidad de transporte y confirmación digital inmediata en cada travesía.
          </p>

          {/* Quick Search Form inside Hero */}
          <form action="/tours" method="get" className="pt-2 w-full max-w-xl">
            <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Busca por destino (Mochima, Morrocoy, Roraima...)"
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-slate-950/80 text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500 border border-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
              >
                <Compass className="h-4 w-4" />
                Buscar Tours
              </button>
            </div>
          </form>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Cero sobreventa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Vouchers con QR</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Pagos multimoneda</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Showcase (Max 4) */}
      {destinations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                Lugares Inolvidables
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Destinos Populares
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explora los paisajes y parajes más solicitados para tu próxima expedición.
              </p>
            </div>
            <Link
              href="/destinos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition py-1"
            >
              Explorar todos los destinos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => {
              const locationText = [dest.city, dest.state].filter(Boolean).join(', ') || dest.country;
              const fallbackImage =
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

              return (
                <Link
                  key={dest.id}
                  href={`/destinos/${dest.slug || dest.id}`}
                  className="group bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dest.imageUrl || fallbackImage}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1.5 text-xs text-slate-200">
                          <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                        {dest.name}
                      </h3>
                      {!isEmptyHtml(dest.description) && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {stripHtml(dest.description)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-teal-700 font-semibold group-hover:underline">
                      Ver tours disponibles
                    </span>
                    <div className="h-6 w-6 rounded-full bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Próximas Salidas Programadas (Organizadas por Día) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
              Calendario de Expediciones
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Próximas Salidas Programadas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fechas confirmadas organizadas por día. Selecciona tu salida y asegura tus cupos con confirmación en tiempo real.
            </p>
          </div>
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition py-1"
          >
            Explorar catálogo de tours <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {upcomingDepartures.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-3xl space-y-3 bg-white">
            <Calendar className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-900">
              No hay salidas programadas para los próximos días.
            </p>
            <p>Estamos preparando nuevos itinerarios. Revisa nuestro catálogo general de tours.</p>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Ver todos los tours
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(departuresByDay).map(([dateKey, dayDepartures]) => {
              const [year, month, day] = dateKey.split('-').map(Number);
              const dateObj = new Date(year, month - 1, day, 12, 0, 0);
              const weekday = dateObj.toLocaleDateString('es-VE', { weekday: 'long' });
              const dayMonth = dateObj.toLocaleDateString('es-VE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div key={dateKey} className="space-y-3">
                  {/* Day Divider / Header */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs capitalize">
                      <Calendar className="h-3.5 w-3.5 text-teal-400" />
                      <span>{weekday}, {dayMonth}</span>
                    </div>
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[11px] font-semibold text-slate-400">
                      {dayDepartures.length} {dayDepartures.length === 1 ? 'salida' : 'salidas'}
                    </span>
                  </div>

                  {/* Salidas una debajo de otra */}
                  <div className="space-y-3">
                    {dayDepartures.map((dep) => {
                      const depDate = new Date(dep.departureDate);
                      const timeStr = dep.meetingTime || depDate.toLocaleTimeString('es-VE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const isSoldOut = dep.availableSlots <= 0;
                      const fallbackImage =
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

                      return (
                        <div
                          key={dep.id}
                          className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Thumbnail + Tour Info */}
                          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                            {/* Tour Image Thumbnail */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={dep.tourImageUrl || fallbackImage}
                                alt={dep.tourName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {dep.tourDurationDays} {dep.tourDurationDays === 1 ? 'Día' : 'Días'}
                              </div>
                            </div>

                            {/* Tour & Departure details */}
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <Clock className="h-3 w-3 text-teal-600" />
                                  {timeStr}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {dep.code}
                                </span>
                                {dep.status === 'confirmed' ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Salida Confirmada
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                    Programada
                                  </span>
                                )}
                              </div>

                              <Link href={`/tours/${dep.tourSlug}`} className="block">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug truncate">
                                  {dep.tourName}
                                </h3>
                              </Link>

                              {dep.meetingPoint && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                                  <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                  <span className="truncate">Punto de encuentro: {dep.meetingPoint}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Cupos, Price & Reservar CTA */}
                          <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                            {/* Cupos */}
                            <div className="text-left md:text-right">
                              {isSoldOut ? (
                                <span className="text-xs font-bold text-rose-600 block">
                                  Agotado
                                </span>
                              ) : (
                                <>
                                  <span className="text-xs font-bold text-emerald-700 block">
                                    {dep.availableSlots} cupos libres
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    de {dep.totalCapacity} capacidad
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-left md:text-right">
                              <span className="text-xl font-extrabold font-mono text-slate-900 block leading-tight">
                                ${dep.effectivePrice}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 block">
                                {dep.currency} / persona
                              </span>
                            </div>

                            {/* Action Button */}
                            <div>
                              {isSoldOut ? (
                                <Link
                                  href={`/tours/${dep.tourSlug}`}
                                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition inline-block text-center whitespace-nowrap"
                                >
                                  Ver Tour
                                </Link>
                              ) : (
                                <Link
                                  href={`/reservar/${dep.id}`}
                                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  Reservar Cupo <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
