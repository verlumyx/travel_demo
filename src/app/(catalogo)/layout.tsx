import Link from 'next/link';
import { Plane, User, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'TravelDemo — Catálogo de Experiencias Turísticas',
  description: 'Descubre los mejores destinos, paquetes y salidas guiadas en Venezuela.',
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">TravelDemo</span>
              <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase block">Agencia de Viajes</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition">Inicio</Link>
            <Link href="/tours" className="hover:text-indigo-600 transition">Tours y Salidas</Link>
            <Link href="/destinos" className="hover:text-indigo-600 transition">Destinos</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition border border-slate-200"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Panel Agencia
            </Link>

            <Link
              href="/cuenta/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition shadow-sm"
            >
              <User className="h-3.5 w-3.5" />
              Mi Cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center text-white">
                  <Plane className="h-4 w-4" />
                </div>
                <span className="font-bold text-base text-white">TravelDemo</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                Plataforma digital para explorar destinos paradisíacos, reservar cupos en salidas programadas y gestionar vouchers de viaje.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
                <li><Link href="/tours" className="hover:text-white transition">Catálogo de Tours</Link></li>
                <li><Link href="/cuenta/reservas" className="hover:text-white transition">Mis Reservas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Equipo</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin/login" className="hover:text-white transition">Acceso Operadores</Link></li>
                <li><Link href="/admin" className="hover:text-white transition">Dashboard Administrativo</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 TravelDemo. Todos los derechos reservados.</p>
            <p className="text-slate-400 font-medium">Next.js App Router + Drizzle ORM + Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
