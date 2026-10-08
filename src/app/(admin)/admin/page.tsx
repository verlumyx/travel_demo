import { requireAuth } from '@/modules/shared/auth/require-auth';
import { getSessionUser } from '@/modules/shared/auth/require-permission';
import { db } from '@/db/client';
import { app_categories } from '@/modules/category/models/category.model';
import { app_destinations } from '@/modules/destination/models/destination.model';
import { app_tours } from '@/modules/tour/models/tour.model';
import { app_departures } from '@/modules/departure/models/departure.model';
import { count } from 'drizzle-orm';
import Link from 'next/link';
import { MapPin, Tag, Compass, CalendarDays, ArrowRight } from 'lucide-react';

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAuth();
  const user = await getSessionUser();

  // Metrics query
  const [[{ count: categoriesCount }], [{ count: destinationsCount }], [{ count: toursCount }], [{ count: departuresCount }]] = await Promise.all([
    db.select({ count: count() }).from(app_categories),
    db.select({ count: count() }).from(app_destinations),
    db.select({ count: count() }).from(app_tours),
    db.select({ count: count() }).from(app_departures),
  ]);

  const cards = [
    {
      title: 'Categorías Turísticas',
      value: Number(categoriesCount),
      description: 'Playa, montaña, río y más',
      icon: Tag,
      url: '/admin/categories',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Destinos Registrados',
      value: Number(destinationsCount),
      description: 'Catálogo de lugares turísticos',
      icon: MapPin,
      url: '/admin/destinations',
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Tours y Paquetes',
      value: Number(toursCount),
      description: 'Experiencias con itinerarios',
      icon: Compass,
      url: '/admin/tours',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Salidas Programadas',
      value: Number(departuresCount),
      description: 'Fechas con aforos asignados',
      icon: CalendarDays,
      url: '/admin/departures',
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-800/40 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ¡Bienvenido, {user?.name || 'Administrador'}! 👋
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          Panel de control y gestión operativa de la agencia. Desde aquí podrás coordinar la flota, programar salidas turísticas, validar pagos multimoneda y emitir manifiestos de abordaje.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.url}
              className={`rounded-xl border p-6 bg-gradient-to-br ${card.color} backdrop-blur-sm transition hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6" />
                <ArrowRight className="h-4 w-4 opacity-50" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
                <div className="text-sm font-semibold text-slate-200 mt-1">{card.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{card.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick shortcuts */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-base font-semibold text-white">Accesos Directos a Operaciones</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link
            href="/admin/categories"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <span>Gestionar Categorías</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link
            href="/admin/destinations"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <span>Directorio de Destinos</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link
            href="/admin/tours"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <span>Paquetes y Tours</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link
            href="/admin/transport-units"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <span>Flota de Transporte</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <span>Control de Reservas</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
          <Link
            href="/admin/payments"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <span>Conciliación de Pagos</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
