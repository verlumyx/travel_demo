import { createCategoryContainer } from '@/modules/category/container';
import { createDestinationContainer } from '@/modules/destination/container';
import { SearchCategoryCommand } from '@/modules/category/commands/search-category.command';
import { SearchDestinationCommand } from '@/modules/destination/commands/search-destination.command';
import { stripHtml, isEmptyHtml } from '@/components/ui/rich-text-view';
import Link from 'next/link';
import {
  MapPin,
  Compass,
  ArrowRight,
  Waves,
  Mountain,
  Trees,
  Building2,
  Droplets,
  Search,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
  }>;
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

export default async function DestinosPublicPage({ searchParams }: PageProps) {
  const { categoria, q } = await searchParams;

  const categoryContainer = createCategoryContainer();
  const destinationContainer = createDestinationContainer();

  // 1. Fetch active categories via service
  const { data: categoriesList } = await categoryContainer.searchService.execute(
    new SearchCategoryCommand({ status: 'active' }, 50, 0),
  );

  const categoryMap = new Map(categoriesList.map((c) => [c.id, c]));
  const matchedCategory = categoria ? categoriesList.find((c) => c.slug === categoria) : undefined;

  // 2. Fetch active destinations via service
  const { data: destinationsList } = await destinationContainer.searchService.execute(
    new SearchDestinationCommand(
      {
        status: 'active',
        categoryId: matchedCategory?.id,
        q,
      },
      60,
      0,
    ),
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
            Rutas y Parajes
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nuestros Destinos Turísticos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Playas de arrecife, selvas tepuyanas, páramos andinos y ríos protegidos en Venezuela listos para tu próxima expedición.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-3.5 sm:p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <Link
              href="/destinos"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-[0.98] transition-all ${
                !categoria
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los destinos
            </Link>

            {categoriesList.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS[cat.icon || ''] || Compass;
              const isSelected = categoria === cat.slug;

              return (
                <Link
                  key={cat.id}
                  href={`/destinos?categoria=${cat.slug}${q ? `&q=${q}` : ''}`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-[0.98] transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Search Input */}
          <form method="GET" action="/destinos" className="relative w-full md:w-72">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar destino o ciudad..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white"
            />
          </form>
        </div>

        {/* Destinations Grid */}
        {destinationsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No encontramos destinos en esta categoría</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Prueba cambiando los filtros o explora todo nuestro catálogo de tours disponibles.
            </p>
            <Link
              href="/destinos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Ver todos los destinos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinationsList.map((dest) => {
              const cat = dest.categoryId ? categoryMap.get(dest.categoryId) : undefined;
              const categorySlug = cat?.slug;
              const categoryName = cat?.name;

              const fallbackImage =
                categorySlug === 'playa'
                  ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
                  : categorySlug === 'montana'
                  ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
                  : categorySlug === 'rio'
                  ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
                  : categorySlug === 'selva'
                  ? 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
                  : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';

              const imageUrl = dest.imageUrl || fallbackImage;
              const IconComponent =
                CATEGORY_ICONS[categorySlug || ''] || CATEGORY_ICONS[cat?.icon || ''] || MapPin;

              const locationText = [dest.city, dest.state, dest.country].filter(Boolean).join(', ');

              return (
                <div
                  key={dest.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col group"
                >
                  {/* Image container */}
                  <Link href={`/destinos/${dest.id}`} className="relative h-52 overflow-hidden bg-slate-900 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {categoryName && (
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-teal-800 shadow-xs">
                        <IconComponent className="h-3 w-3 text-teal-600" />
                        {categoryName}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <MapPin className="h-3.5 w-3.5 text-teal-400" />
                        <span className="truncate">{locationText}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <Link href={`/destinos/${dest.id}`} className="block">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition tracking-tight">
                          {dest.name}
                        </h3>
                      </Link>
                      {!isEmptyHtml(dest.description) && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {stripHtml(dest.description)}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                      <Link
                        href={`/destinos/${dest.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
                      >
                        Ver Tours <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
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
