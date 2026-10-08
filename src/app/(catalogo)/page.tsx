import { db } from '@/db/client';
import { app_categories } from '@/modules/category/models/category.model';
import Link from 'next/link';
import { Compass, ShieldCheck, CreditCard, Users, ArrowRight, Waves, Mountain, Droplets, Trees, Building, Sparkles } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  waves: Waves,
  mountain: Mountain,
  droplets: Droplets,
  trees: Trees,
  building: Building,
};

export const instant = false;

export default async function HomePage() {
  const categories = await db.select().from(app_categories);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Experiencias y Salidas Programadas
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Descubre los mejores destinos turísticos de Venezuela
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Catálogo unificado de salidas grupales, transporte asegurado, atención personalizada y confirmación digital de cupos.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tours"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              Explorar Catálogo de Tours
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explora por Categoría Turística
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Elige el tipo de experiencia que estás buscando para tu próxima salida
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = (cat.icon && ICON_MAP[cat.icon]) || Compass;
            return (
              <Link
                key={cat.id}
                href={`/tours?category=${cat.slug}`}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 transition duration-200"
              >
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-200">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Aforo y Cupos Garantizados</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Control de capacidad atómico por unidad de transporte. Cero sobreventa y asignación transparente de asientos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Pagos Multimoneda y Fraccionados</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Reporta pagos vía Pago Móvil, Zelle, Binance, efectivo USD/VES o transferencias con verificación inmediata.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Vouchers y Manifiesto de Viaje</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Accede a tu comprobante digital y listas de abordaje oficiales para guías y choferes con datos de emergencia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
