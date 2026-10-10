import Link from 'next/link';
import { Compass, User, ShieldCheck, MapPin } from 'lucide-react';

export const metadata = {
  title: 'TravelDemo - Catálogo de Experiencias Turísticas',
  description: 'Descubre los mejores destinos, paquetes y salidas guiadas en Venezuela.',
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs shadow-teal-700/20 group-hover:bg-teal-700 transition">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">TravelDemo</span>
              <span className="text-[10px] text-teal-700 font-semibold tracking-wider uppercase block">Expediciones Venezuela</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-teal-700 transition py-1">Inicio</Link>
            <Link href="/tours" className="hover:text-teal-700 transition py-1">Tours y Salidas</Link>
            <Link href="/destinos" className="hover:text-teal-700 transition py-1">Destinos</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100/90 hover:bg-slate-200 rounded-lg transition border border-slate-200"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
              Panel Agencia
            </Link>

            <Link
              href="/cuenta/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-lg transition shadow-xs"
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
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">TravelDemo Expediciones</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Plataforma digital para explorar expediciones venezolanas, reservar cupos con aforo asegurado y gestionar vouchers oficiales con código QR.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-teal-400 font-medium pt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Caracas, Mochima, Canaima, Mérida y Los Roques</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Catálogo</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
                <li><Link href="/tours" className="hover:text-white transition">Tours y Próximas Salidas</Link></li>
                <li><Link href="/destinos" className="hover:text-white transition">Guía de Destinos</Link></li>
                <li><Link href="/cuenta/reservas" className="hover:text-white transition">Portal del Pasajero</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Operadores</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/admin/login" className="hover:text-white transition">Acceso de Operadores</Link></li>
                <li><Link href="/admin" className="hover:text-white transition">Control de Flota y Manifiestos</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>© 2026 TravelDemo. Todos los derechos reservados.</p>
            <p className="text-slate-400 font-medium">Turismo sustentable y expediciones con logística verificada</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
