import { requireAuth } from '@/modules/shared/auth/require-auth';
import { getSessionUserWithRole } from '@/modules/shared/auth/require-permission';
import { createDashboardContainer } from '@/modules/dashboard/container';
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
  BookOpen,
} from 'lucide-react';
import { PaymentMethodBadge } from '@/modules/payment/ui/PaymentMethodBadge';

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAuth();
  const user = await getSessionUserWithRole();

  const container = createDashboardContainer();
  const {
    monthSales,
    monthBookingsCount,
    verifiedAmount,
    pendingAmount,
    pendingPaymentsCount,
    totalCapacity,
    totalBooked,
    activeDeparturesCount,
    globalOccupationRate,
    priorityPendingPayments,
    upcomingDepartures,
    pendingBalanceBookings,
  } = await container.metricsService.execute();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 border border-teal-600/30 p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white">
        <div>
          <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Panel de Operaciones en Vivo
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Hola, {user?.name || 'Administrador'} 👋
          </h1>
          <p className="mt-1.5 text-sm text-teal-100/90 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de ventas, conciliación de pagos multimoneda y ocupación de flota turística.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/guia"
            className="px-3.5 py-2.5 rounded-xl bg-teal-500/25 hover:bg-teal-500/40 active:scale-[0.98] text-teal-100 border border-teal-400/40 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-teal-300" />
            Guía de Módulos
          </Link>
          <Link
            href="/admin/bookings/create"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-teal-900 font-semibold text-xs transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            Nueva Reserva
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 active:scale-[0.98] text-white border border-teal-500/40 font-semibold text-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            Auditar Pagos
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ventas del Mes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ventas del Mes
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
              ${monthSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{monthBookingsCount} reservas</span>
              <span>emitidas este mes</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Ingresos Conciliados */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ingresos Conciliados
            </span>
            <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
              ${verifiedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verificados y aprobados</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pagos por Conciliar */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Por Conciliar
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-extrabold text-amber-900 tracking-tight">
              ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{pendingPaymentsCount} pagos pendientes</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Ocupación Global Flota */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ocupación de Flota
            </span>
            <div className="h-9 w-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-2xs">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
              {globalOccupationRate}%
            </div>
            <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, globalOccupationRate)}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {totalBooked} de {totalCapacity} cupos ({activeDeparturesCount} salidas)
            </div>
          </div>
        </div>
      </div>

      {/* Priority Action Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority 1: Pagos Pendientes de Conciliación */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Pagos por Auditar</h2>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
            >
              Ver todos ({pendingPaymentsCount}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Comprobantes subidos por pasajeros o agentes en espera de revisión contable.
          </p>

          <div className="divide-y divide-slate-100">
            {priorityPendingPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                ¡Al día! No hay pagos pendientes de verificación.
              </div>
            ) : (
              priorityPendingPayments.map(({ payment, booking, customer }) => (
                <div key={payment.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs text-slate-900">
                        {payment.code}
                      </span>
                      <PaymentMethodBadge method={payment.method} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {customer.fullName} • Reserva <span className="font-mono text-slate-700">{booking.code}</span>
                    </p>
                    {payment.reference && (
                      <p className="text-[11px] font-mono text-slate-400">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      ${payment.amount} {payment.currency}
                    </div>
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="mt-1 text-xs px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium inline-block transition shadow-2xs"
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Próximas Salidas</h2>
            </div>
            <Link
              href="/admin/departures"
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
            >
              Ver calendario <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Salidas programadas y aforo de vehículos para emitir el manifiesto de abordaje.
          </p>

          <div className="divide-y divide-slate-100">
            {upcomingDepartures.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
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
                        <span className="font-mono font-semibold text-xs text-teal-700">
                          {departure.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(departure.departureDate).toLocaleDateString('es-VE')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {tour.name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${percent >= 90 ? 'bg-rose-500' : percent >= 50 ? 'bg-teal-600' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {departure.bookedSlots}/{departure.totalCapacity} ({percent}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Link
                        href={`/admin/departures/${departure.id}/manifest`}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium inline-flex items-center gap-1 transition"
                      >
                        Manifiesto <ExternalLink className="h-3 w-3 text-slate-400" />
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Reservas con Saldo Pendiente de Cobro</h2>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50/50">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pendingBalanceBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No hay reservas con saldos pendientes por conciliar.
                  </td>
                </tr>
              ) : (
                pendingBalanceBookings.map(({ booking, customer, departure }) => {
                  const pending = Math.max(0, Number(booking.totalAmount) - Number(booking.paidAmount));

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-medium text-teal-700">
                        {booking.code}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {customer.fullName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {departure.code} ({new Date(departure.departureDate).toLocaleDateString('es-VE')})
                      </td>
                      <td className="py-2.5 px-3">
                        {booking.slotsReserved} cupos
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        ${booking.totalAmount}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">
                        ${booking.paidAmount}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-600">
                        ${pending.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-xs text-teal-700 hover:text-teal-900 hover:underline font-semibold"
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
