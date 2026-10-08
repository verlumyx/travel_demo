import { requireAuth } from '@/modules/shared/auth/require-auth';
import { getSessionUserWithRole } from '@/modules/shared/auth/require-permission';
import { db } from '@/db/client';
import { bookings } from '@/modules/booking/models/booking.model';
import { payments } from '@/modules/payment/models/payment.model';
import { departures } from '@/modules/departure/models/departure.model';
import { tours } from '@/modules/tour/models/tour.model';
import { customers } from '@/modules/customer/models/customer.model';
import { eq, ne, sql, desc, asc, inArray } from 'drizzle-orm';
import Link from 'next/link';
import {
  DollarSign,
  CreditCard,
  CalendarDays,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { PaymentStatusBadge } from '@/modules/payment/ui/PaymentStatusBadge';
import { PaymentMethodBadge } from '@/modules/payment/ui/PaymentMethodBadge';
import { BookingStatusBadge } from '@/modules/booking/ui/BookingStatusBadge';

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAuth();
  const user = await getSessionUserWithRole();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Metrics query in parallel
  const [
    monthBookingsResult,
    verifiedPaymentsResult,
    pendingPaymentsResult,
    activeDeparturesResult,
    priorityPendingPayments,
    upcomingDepartures,
    pendingBalanceBookings,
  ] = await Promise.all([
    // Total ventas del mes en curso (reservas no canceladas)
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${bookings.totalAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(bookings)
      .where(sql`${bookings.createdAt} >= ${startOfMonth} AND ${bookings.status} != 'cancelled'`),

    // Ingresos conciliados (verified)
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(payments)
      .where(eq(payments.status, 'verified')),

    // Ingresos pendientes por auditar (pending)
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(payments)
      .where(eq(payments.status, 'pending')),

    // Ocupación global de flota en salidas activas
    db
      .select({
        totalCapacity: sql<number>`COALESCE(SUM(${departures.totalCapacity}), 0)`,
        totalBooked: sql<number>`COALESCE(SUM(${departures.bookedSlots}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(departures)
      .where(inArray(departures.status, ['scheduled', 'confirmed'])),

    // Lista prioritaria 1: Pagos pendientes de verificación (últimos 5)
    db
      .select({
        payment: payments,
        booking: bookings,
        customer: customers,
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.id))
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .where(eq(payments.status, 'pending'))
      .orderBy(desc(payments.createdAt))
      .limit(5),

    // Lista prioritaria 2: Próximas salidas programadas (próximas 5)
    db
      .select({
        departure: departures,
        tour: tours,
      })
      .from(departures)
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .where(inArray(departures.status, ['scheduled', 'confirmed']))
      .orderBy(asc(departures.departureDate))
      .limit(5),

    // Lista prioritaria 3: Reservas activas con saldo pendiente
    db
      .select({
        booking: bookings,
        customer: customers,
        departure: departures,
      })
      .from(bookings)
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .where(
        sql`${bookings.status} IN ('pending', 'partial_payment') AND ${bookings.status} != 'cancelled'`,
      )
      .orderBy(desc(bookings.createdAt))
      .limit(5),
  ]);

  const monthSales = Number(monthBookingsResult[0]?.totalAmount || 0);
  const monthBookingsCount = Number(monthBookingsResult[0]?.count || 0);

  const verifiedAmount = Number(verifiedPaymentsResult[0]?.totalAmount || 0);
  const pendingAmount = Number(pendingPaymentsResult[0]?.totalAmount || 0);
  const pendingPaymentsCount = Number(pendingPaymentsResult[0]?.count || 0);

  const totalCapacity = Number(activeDeparturesResult[0]?.totalCapacity || 0);
  const totalBooked = Number(activeDeparturesResult[0]?.totalBooked || 0);
  const activeDeparturesCount = Number(activeDeparturesResult[0]?.count || 0);
  const globalOccupationRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-indigo-800/40 p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Panel de Operaciones en Vivo
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Hola, {user?.name || 'Administrador'} 👋
          </h1>
          <p className="mt-1.5 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de ventas, conciliación de pagos multimoneda y ocupación de flota turística.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
          >
            Nueva Reserva
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition inline-flex items-center gap-2"
          >
            Auditar Pagos
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ventas del Mes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ventas del Mes
            </span>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
              ${monthSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{monthBookingsCount} reservas</span>
              <span>emitidas este mes</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Ingresos Conciliados */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ingresos Conciliados
            </span>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
              ${verifiedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verificados y aprobados</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pagos por Conciliar */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Por Conciliar
            </span>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-bold text-amber-300 tracking-tight">
              ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400/80">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{pendingPaymentsCount} pagos pendientes</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Ocupación Global Flota */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocupación de Flota
            </span>
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
              {globalOccupationRate}%
            </div>
            <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, globalOccupationRate)}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {totalBooked} de {totalCapacity} cupos reservados ({activeDeparturesCount} salidas activas)
            </div>
          </div>
        </div>
      </div>

      {/* Priority Action Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority 1: Pagos Pendientes de Conciliación */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Pagos por Auditar</h2>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              Ver todos ({pendingPaymentsCount}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Comprobantes subidos por pasajeros o agentes en espera de revisión contable.
          </p>

          <div className="divide-y divide-slate-800/80">
            {priorityPendingPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                ¡Al día! No hay pagos pendientes de verificación.
              </div>
            ) : (
              priorityPendingPayments.map(({ payment, booking, customer }) => (
                <div key={payment.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs text-white">
                        {payment.code}
                      </span>
                      <PaymentMethodBadge method={payment.method} />
                    </div>
                    <p className="text-xs text-slate-300 mt-1 truncate">
                      {customer.firstName} {customer.lastName} • Reserva <span className="font-mono text-slate-400">{booking.code}</span>
                    </p>
                    {payment.reference && (
                      <p className="text-[11px] font-mono text-slate-500">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm text-white">
                      ${payment.amount} {payment.currency}
                    </div>
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="mt-1 text-xs px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium inline-block transition"
                    >
                      Auditar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority 2: Próximas Salidas y Manifiestos */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Próximas Salidas</h2>
            </div>
            <Link
              href="/admin/departures"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              Ver calendario <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Salidas programadas y aforo de vehículos para emitir el manifiesto de abordaje.
          </p>

          <div className="divide-y divide-slate-800/80">
            {upcomingDepartures.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay salidas programadas próximamente.
              </div>
            ) : (
              upcomingDepartures.map(({ departure, tour }) => {
                const percent = departure.totalCapacity > 0
                  ? Math.round((departure.bookedSlots / departure.totalCapacity) * 100)
                  : 0;

                return (
                  <div key={departure.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-emerald-400">
                          {departure.code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(departure.departureDate).toLocaleDateString('es-VE')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white mt-1 truncate">
                        {tour.name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${percent >= 90 ? 'bg-rose-500' : percent >= 50 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {departure.bookedSlots}/{departure.totalCapacity} ({percent}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Link
                        href={`/admin/departures/${departure.id}/manifest`}
                        className="text-xs px-2.5 py-1 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium inline-flex items-center gap-1 transition"
                      >
                        Manifiesto <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Priority 3: Reservas Activas con Saldo Pendiente */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Reservas con Saldo Pendiente de Cobro</h2>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Salida</th>
                <th className="py-2.5 px-3">Cupos</th>
                <th className="py-2.5 px-3">Monto Total</th>
                <th className="py-2.5 px-3">Abonado</th>
                <th className="py-2.5 px-3">Saldo Restante</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {pendingBalanceBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No hay reservas con saldos pendientes por conciliar.
                  </td>
                </tr>
              ) : (
                pendingBalanceBookings.map(({ booking, customer, departure }) => {
                  const pending = Math.max(0, Number(booking.totalAmount) - Number(booking.paidAmount));

                  return (
                    <tr key={booking.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono font-medium text-indigo-400">
                        {booking.code}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {departure.code} ({new Date(departure.departureDate).toLocaleDateString('es-VE')})
                      </td>
                      <td className="py-2.5 px-3">
                        {booking.slotsReserved} cupos
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        ${booking.totalAmount}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">
                        ${booking.paidAmount}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        ${pending.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
