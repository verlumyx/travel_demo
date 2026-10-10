import { createCategoryContainer } from '@/modules/category/container';
import { createTourContainer } from '@/modules/tour/container';
import { SearchTourCommand } from '@/modules/tour/commands/search-tour.command';
import { toCategoryDto } from '@/modules/category/serializers/category.serializer';
import { toTourDto } from '@/modules/tour/serializers/tour.serializer';
import { stripHtml, isEmptyHtml } from '@/components/ui/rich-text-view';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  CreditCard,
  Users,
  ArrowRight,
  Waves,
  Mountain,
  Droplets,
  Trees,
  Building,
  Search,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  waves: Waves,
  mountain: Mountain,
  droplets: Droplets,
  trees: Trees,
  building: Building,
};

export const instant = false;

export default async function HomePage() {
  const catContainer = createCategoryContainer();
  const tourContainer = createTourContainer();

  const [rawCategories, toursResult] = await Promise.all([
    catContainer.repository.getActive(),
    tourContainer.repository.search(SearchTourCommand.fromInput({ status: 'active', limit: 3, offset: 0 })),
  ]);

  const categories = rawCategories.map(toCategoryDto);
  const featuredTours = toursResult.data.map(toTourDto);

  return (
    <div className="space-y-20 pb-24">
      {/* Hero Section: Asymmetric Split Hero fitting initial viewport */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-14 md:pt-14 md:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -z-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline, subtext, search bar, and primary action */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-[11px] font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              Expediciones Guiadas 2026
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] text-white">
              Rutas extraordinarias por los destinos más salvajes de Venezuela.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Salidas grupales programadas, cupos garantizados por unidad de transporte y confirmación digital inmediata en cada travesía.
            </p>

            {/* Quick Search Form inside Hero */}
            <form action="/tours" method="get" className="pt-1 max-w-xl">
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

            <div className="pt-1 flex items-center gap-6 text-xs text-slate-400">
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

          {/* Right Column: Visual Photographic Card with Live Tag */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                alt="Parque Nacional Mochima en Venezuela"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-teal-300">
                Salidas Abiertas
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                  Caribe Venezolano
                </span>
                <h3 className="text-lg font-bold leading-snug">
                  Cayo Sombrero y Playas de Mochima
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Aguas turquesas, pernocta guiada y traslados marítimos autorizados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Categorías de Expedición
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Elige el tipo de paisaje natural y actividad para tu próxima fecha de viaje.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = (cat.icon && ICON_MAP[cat.icon]) || Compass;
            return (
              <Link
                key={cat.id}
                href={`/tours?category=${cat.slug}`}
                className="group flex flex-col p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-500 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
              >
                <div className="h-11 w-11 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                  {cat.name}
                </h3>
                {!isEmptyHtml(cat.description) && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {stripHtml(cat.description)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Tours Grid */}
      {featuredTours.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Próximas Experiencias Destacadas
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Paquetes con itinerario cerrado, guías calificados y transporte verificado.
              </p>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition py-1"
            >
              Explorar todos los tours <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTours.map((t) => (
              <div
                key={t.id}
                className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
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
                    <div className="absolute top-3 left-3 bg-white/95 text-slate-900 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs">
                      {t.durationDays} {t.durationDays === 1 ? 'Día' : 'Días'}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold font-mono border border-white/10">
                      ${t.basePrice} USD
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                      {t.name}
                    </h3>
                    {t.shortDescription && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {t.shortDescription}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Cupos confirmados</span>
                  <Link
                    href={`/tours/${t.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-semibold transition shadow-xs"
                  >
                    Ver Fechas <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Asymmetric Bento Value Proposition: Safety, Multi-Currency, QR Boarding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Wide Card: Fleet and Atomic Capacity */}
          <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Aforo y Asientos Garantizados
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                Control de capacidad atómico por unidad de transporte. Cada cupo reservado descuenta asientos reales de vans, autobuses o embarcaciones autorizadas para eliminar la sobreventa.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="font-bold text-white block text-sm">Flota Oficial</span>
                <span className="text-slate-400">Choferes y unidades inspeccionadas</span>
              </div>
              <div>
                <span className="font-bold text-white block text-sm">Cero Sobreventa</span>
                <span className="text-slate-400">Bloqueo de cupo en tiempo real</span>
              </div>
            </div>
          </div>

          {/* Stacked Side Cards: Multi-Currency & QR Manifest */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Payment Flexibility */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs space-y-2 flex-1">
              <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <CreditCard className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Pagos Multimoneda y Fraccionados
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reporta pagos vía Pago Móvil, Zelle, Binance, transferencias o efectivo con conciliación de comprobantes.
              </p>
            </div>

            {/* QR Vouchers & Boarding Manifest */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs space-y-2 flex-1">
              <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <Users className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Vouchers Digitales y Manifiesto de Abordaje
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Boletos con código QR para validación en el punto de encuentro y listas de abordaje oficiales con datos de emergencia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
