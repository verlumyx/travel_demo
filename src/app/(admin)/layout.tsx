import { getSessionUser } from '@/modules/shared/auth/require-permission';
import { readFlash } from '@/modules/shared/flash/flash';
import { FlashToaster } from '@/modules/shared/flash/FlashToaster';
import { AdminSidebar } from '@/modules/shared/ui/AdminSidebar';

export const metadata = {
  title: 'TravelDemo — Panel Administrativo',
  description: 'Gestión operativa y comercial para agencias de viajes',
};

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const flash = await readFlash();

  // If there is no authenticated user (e.g. on /admin/login), render full-screen content without sidebar
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <FlashToaster flash={flash} />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <FlashToaster flash={flash} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
