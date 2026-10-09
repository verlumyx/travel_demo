import Link from 'next/link';
import { createCategoryContainer } from '@/modules/category/container';
import { createTourContainer } from '@/modules/tour/container';
import { toCategoryDto } from '@/modules/category/serializers/category.serializer';
import {
  Compass,
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Tag,
  MapPin,
  Utensils,
  BedDouble,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    maxPrice?: string;
    duration?: string;
  }>;
}

export default async function ToursCatalogPage({ searchParams }: PageProps) {
  const { q, category, maxPrice, duration } = await searchParams;

  const catContainer = createCategoryContainer();
  const tourContainer = createTourContainer();

  // 1. Fetch categories and catalog tours via repositories
  const [rawCategories, tourCards] = await Promise.all([
    catContainer.repository.getActive(),
    tourContainer.repository.getCatalogTours({
      q,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      duration: duration ? Number(duration) : undefined,
    }),
  ]);

  const categories = rawCategories.map(toCategoryDto);
  const selectedCat = categories.find((c) => c.slug === category);

  // If a category was chosen, filter tours whose stops match that category
  const filteredTours = selectedCat
    ? tourCards.filter((t) => t.categorySlug === selectedCat.slug)
    : tourCards;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header & Title */}
      <div className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Catálogo Oficial
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tours y Experiencias Guiadas
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Selecciona tu próximo destino, revisa el itinerario detallado y asegura tus cupos con confirmación en tiempo real.
        </p>
      </div>

      {/* Filter Toolbar & Categories Pills */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/tours"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              !category
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todas las categorías
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/tours?category=${c.slug}${q ? `&q=${q}` : ''}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                category === c.slug
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Search bar & Range inputs */}
        <form method="get" className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
          {category && <input type="hidden" name="category" value={category} />}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Buscar tour por nombre, destino o palabras clave..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              name="maxPrice"
              defaultValue={maxPrice ?? ''}
              placeholder="Precio máx ($)"
              className="w-32 px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 font-mono focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <select
              name="duration"
              defaultValue={duration ?? ''}
              className="px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Cualquier duración</option>
              <option value="1">1 día (Full Day)</option>
              <option value="2">Hasta 2 días</option>
              <option value="4">Hasta 4 días</option>
              <option value="7">Hasta 7 días</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs cursor-pointer"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <div className="p-16 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-3xl space-y-3 bg-white">
          <Compass className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">No encontramos tours con estos criterios.</p>
          <p>Prueba limpiando los filtros o buscando con otro término.</p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition pt-2"
          >
            Ver todos los tours
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((t) => (
            <div
              key={t.id}
              className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Cover */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  {t.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-900 to-slate-900 text-indigo-300">
                      <Compass className="h-12 w-12 opacity-40" />
                    </div>
                  )}

                  {/* Category & Duration Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {t.categoryName && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 shadow-xs">
                        {t.categoryName}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      {t.durationDays} {t.durationDays === 1 ? 'Día' : 'Días'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold font-mono">
                    ${t.basePrice} USD
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 block">
                      {t.code} {t.destinationName ? `• ${t.destinationName}` : ''}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition mt-0.5">
                      {t.name}
                    </h3>
                  </div>

                  {t.shortDescription && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {t.shortDescription}
                    </p>
                  )}

                  {/* Highlights pills */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    {t.includesFood && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Utensils className="h-3 w-3" /> Comida
                      </span>
                    )}
                    {t.includesLodging && (
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
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
                    <span className="text-[11px] text-emerald-600 font-semibold block">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs"
                >
                  Ver Ficha <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
