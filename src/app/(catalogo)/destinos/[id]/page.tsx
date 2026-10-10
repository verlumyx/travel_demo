import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createDestinationContainer } from '@/modules/destination/container';
import { createCategoryContainer } from '@/modules/category/container';
import { createTourContainer } from '@/modules/tour/container';
import { RichTextView, isEmptyHtml } from '@/components/ui/rich-text-view';
import {
  MapPin,
  Compass,
  ArrowLeft,
  ArrowRight,
  Waves,
  Mountain,
  Trees,
  Building2,
  Droplets,
  Utensils,
  BedDouble,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  playa: Waves,
  waves: Waves,
  montana: Mountain,
  mountain: Mountain,
  rio: Droplets,
  droplets: Droplets,
  selva: Trees,
  trees: Trees,
  ciudad: Building2,
  building: Building2,
};

export default async function DestinoDetailPage({ params }: PageProps) {
  const { id } = await params;

  const destinationContainer = createDestinationContainer();
  const categoryContainer = createCategoryContainer();
  const tourContainer = createTourContainer();

  // 1. Fetch destination by id or slug
  const destination = await destinationContainer.findService.findByIdOrSlug(id);
  if (!destination || destination.status !== 'active') {
    notFound();
  }

  // 2. Fetch category details if assigned
  let categoryName: string | null = null;
  let categorySlug: string | null = null;
  let categoryIcon: string | null = null;

  if (destination.categoryId) {
    try {
      const cat = await categoryContainer.findService.execute(destination.categoryId);
      categoryName = cat.name;
      categorySlug = cat.slug;
      categoryIcon = cat.icon ?? null;
    } catch {
      // ignore
    }
  }

  // 3. Fetch active tours visiting this destination via itinerary stops
  const tours = await tourContainer.catalogService.execute({
    destinationId: destination.id,
  });

  const CategoryIconComponent =
    CATEGORY_ICONS[categorySlug || ''] || CATEGORY_ICONS[categoryIcon || ''] || MapPin;

  const fallbackImage =
    categorySlug === 'playa'
      ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
      : categorySlug === 'montana'
      ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
      : categorySlug === 'rio'
      ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
      : categorySlug === 'selva'
      ? 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80';

  const heroImage = destination.imageUrl || fallbackImage;
  const locationText = [destination.city, destination.state, destination.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/destinos"
            className="inline-flex items-center gap-1.5 font-medium hover:text-teal-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Destinos
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition">Inicio</Link>
            <span>/</span>
            <Link href="/destinos" className="hover:text-slate-600 transition">Destinos</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{destination.name}</span>
          </div>
        </div>

        {/* Destination Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

            {/* Badges on Top */}
            {categoryName && (
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-teal-800 shadow-xs">
                  <CategoryIconComponent className="h-3.5 w-3.5 text-teal-600" />
                  {categoryName}
                </div>
              </div>
            )}

            {/* Destination Info on Bottom */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-2">
              {locationText && (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-teal-300 font-medium">
                  <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>{locationText}</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-xs">
                {destination.name}
              </h1>
            </div>
          </div>

          {/* Description & Overview Bar */}
          <div className="p-6 sm:p-8 space-y-6">
            {!isEmptyHtml(destination.description) && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Sobre este destino
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                  <RichTextView content={destination.description} />
                </div>
              </div>
            )}

            {/* Quick stats pills */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-semibold border border-teal-100">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                {tours.length} {tours.length === 1 ? 'Tour disponible' : 'Tours disponibles'}
              </span>
              {locationText && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {locationText}
                </span>
              )}
              <Link
                href={`/tours?destinationId=${destination.id}`}
                className="ml-auto inline-flex items-center gap-1.5 text-teal-700 font-semibold hover:text-teal-800 transition text-xs"
              >
                Ver en catálogo general de tours <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section: Tours que incluyen este destino */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                Itinerarios y Expediciones
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Tours que incluyen {destination.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Paquetes turísticos, full days y viajes con paradas programadas en este destino.
              </p>
            </div>
          </div>

          {tours.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <Compass className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Aún no hay tours activos programados para este destino
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Estamos diseñando nuevas salidas y expediciones hacia {destination.name}. Mientras tanto, te invitamos a explorar nuestro catálogo completo o descubrir otros destinos.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 active:scale-[0.98] transition shadow-xs"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Explorar todos los tours
                </Link>
                <Link
                  href="/destinos"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
                >
                  Ver otros destinos
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((t) => (
                <div
                  key={t.id}
                  className="group bg-white border border-slate-200 hover:border-slate-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Cover */}
                    <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                      {t.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.imageUrl}
                          alt={t.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-teal-400">
                          <Compass className="h-12 w-12 opacity-30" />
                        </div>
                      )}

                      {/* Category & Duration Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {t.categoryName && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 shadow-xs">
                            {t.categoryName}
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/70 text-white backdrop-blur-xs">
                          {t.durationDays} {t.durationDays === 1 ? 'Día' : 'Días'}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold font-mono border border-white/10">
                        ${t.basePrice} USD
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        {t.destinationName && (
                          <span className="text-[10px] font-bold text-teal-700 block">
                            {t.destinationName}
                          </span>
                        )}
                        <Link href={`/tours/${t.slug}`}>
                          <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition mt-0.5">
                            {t.name}
                          </h3>
                        </Link>
                      </div>

                      {t.shortDescription && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {t.shortDescription}
                        </p>
                      )}

                      {/* Highlights pills */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        {t.includesFood && (
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <Utensils className="h-3 w-3" /> Comida
                          </span>
                        )}
                        {t.includesLodging && (
                          <span className="flex items-center gap-1 text-teal-700 font-medium">
                            <BedDouble className="h-3 w-3" /> Hotel
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card Footer */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <div>
                      {t.upcomingDeparturesCount > 0 ? (
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          {t.upcomingDeparturesCount} salida(s) disponible(s)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 block">
                          Próximas fechas por abrir
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/tours/${t.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 active:scale-[0.98] transition shadow-xs"
                    >
                      Ver Ficha <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
