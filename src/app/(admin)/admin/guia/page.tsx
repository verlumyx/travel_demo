import { requireAuth } from '@/modules/shared/auth/require-auth';
import Link from 'next/link';
import {
  Compass,
  Bus,
  Ticket,
  CreditCard,
  Users,
  Shield,
  WalletCards,
  CheckCircle2,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CalendarDays,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

export const instant = false;

export default async function AdminGuiaPage() {
  await requireAuth();

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 border border-teal-700/40 p-6 md:p-10 shadow-lg text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-xs font-semibold text-teal-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              Manual y Centro de Experiencia de la Demo
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Guía Operativa del Panel Administrativo
            </h1>
            <p className="text-sm md:text-base text-teal-100/90 leading-relaxed">
              Descubre cómo TravelDemo digitaliza toda la operación de una agencia de turismo: desde la publicación de experiencias y control estricto de cupos por autobús, hasta la conciliación de pagos y la emisión de listas de pasajeros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/Guia_Panel_Administrativo_TravelDemo.pdf"
              download="Guia_Panel_Administrativo_TravelDemo.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs md:text-sm transition shadow-md cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Descargar Guía en PDF
            </a>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 font-semibold text-xs md:text-sm transition cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Portal del Turista
            </Link>
          </div>
        </div>
      </div>

      {/* Recorrido Rápido de 5 Minutos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white text-sm font-black">
                ★
              </span>
              Ruta Guiada para Probar la Demo en 5 Minutos
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Sigue estos 4 pasos para comprobar el flujo operativo de inicio a fin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Paso 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                  01
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Portal Público</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                Simula una Reserva como Viajero
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entra a la página pública del cliente, elige un tour activo, selecciona 2 pasajeros e ingresa los datos de contacto.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/tours"
                target="_blank"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
              >
                Abrir Catálogo de Tours
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                  02
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Panel Admin</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                Revisa la Entrada en Reservas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ve a <strong>Reservas</strong>. Comprobarás que la solicitud acaba de ingresar en tiempo real con su código y pasajeros asignados.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
              >
                Ir a Reservas
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                  03
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Finanzas</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                Audita y Aprueba el Pago
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                En el módulo de <strong>Pagos</strong>, valida el comprobante bancario. Al aprobarlo, el estado pasa a confirmado automáticamente.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/payments"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
              >
                Ir a Pagos
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                  04
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Operaciones</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                Verifica Aforo y Manifiesto
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entra a <strong>Salidas</strong>: verás que la unidad de transporte descontó los 2 puestos y la lista de pasajeros está lista para tus guías.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/departures"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
              >
                Ver Salidas y Flota
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos en Detalle */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Explicación de Módulos Operativos
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Cada módulo está diseñado para resolver un cuello de botella específico en la agencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Salidas y Cupos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-teal-400/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                Operaciones
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Salidas y Control de Aforo</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Aquí programas cada fecha de viaje. Asignas las unidades de transporte (autobuses de 48 puestos, vans de 18, lanchas) y el sistema garantiza que no se venda ni un solo puesto de más.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Previene Overbooking</span>
              <Link
                href="/admin/departures"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Probar módulo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card: Flota de Transporte */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-teal-400/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Bus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                Logística
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Unidades de Transporte</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Registra tu flota de autobuses, minibuses y transportes aliados con sus matrículas, choferes y capacidades máximas. Puedes combinar múltiples vehículos en una misma salida.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Gestión de flota</span>
              <Link
                href="/admin/transport-units"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Probar módulo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card: Reservas y Pasajeros */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-teal-400/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                Comercial
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reservas y Manifiestos</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Centraliza todas las ventas en línea y presenciales. Guarda los datos completos de los pasajeros y genera automáticamente la lista de abordaje con contactos de emergencia.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Lista de abordaje lista</span>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Probar módulo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card: Conciliación de Pagos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-teal-400/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Tesorería
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Auditoría de Pagos y Abonos</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Se acabaron las horas buscando referencias bancarias. El cliente sube su comprobante y tú lo apruebas o rechazas con 1 clic. Soporta abonos del 50% y saldos pendientes.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Conciliación ágil</span>
              <Link
                href="/admin/payments"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Probar módulo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card: Tours y Experiencias */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-teal-400/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-100 text-purple-800 uppercase tracking-wider">
                Catálogo
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tours e Itinerarios</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Crea tus paquetes turísticos con imágenes, itinerarios paso a paso, paradas programadas y precios base en divisas o moneda local.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Vitrina de ventas</span>
              <Link
                href="/admin/tours"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Probar módulo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card: Métodos de Pago */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-teal-400/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <WalletCards className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-100 text-rose-800 uppercase tracking-wider">
                Configuración
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Métodos de Cobro Multicanal</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Configura las cuentas bancarias de la agencia: Pago Móvil, Zelle, Transferencias, Divisas en efectivo o billeteras digitales con sus instrucciones de pago.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Bimoneda / Multicanal</span>
              <Link
                href="/admin/payment-methods"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Probar módulo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Credenciales de Acceso */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-100 px-2.5 py-0.5 rounded-full">
            Acceso Rápido a la Demo
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-1">
            Credenciales del Panel Administrativo
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Úsalas para iniciar sesión con permisos de Administrador total.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl">
            <span className="text-[10px] block font-sans font-semibold text-slate-400 uppercase">Usuario</span>
            <span className="font-bold text-teal-900">admin@traveldemo.com</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl">
            <span className="text-[10px] block font-sans font-semibold text-slate-400 uppercase">Contraseña</span>
            <span className="font-bold text-teal-900">AdminPassword123*</span>
          </div>
        </div>
      </div>

      {/* Call to action & Descarga */}
      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">¿Quieres compartir esta guía con tu equipo o socios?</h3>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl">
            Descarga el archivo PDF formateado para imprimir o compartir directamente por WhatsApp. Incluye las credenciales de la demo y los pasos del flujo operativo.
          </p>
        </div>
        <a
          href="/Guia_Panel_Administrativo_TravelDemo.pdf"
          download="Guia_Panel_Administrativo_TravelDemo.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition shadow-lg inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" />
          Descargar Guía Oficial en PDF
        </a>
      </div>
    </div>
  );
}
