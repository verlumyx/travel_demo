import { getSessionUserWithRole, hasPermission } from '@/modules/shared/auth/require-permission';
import { readFlash } from '@/modules/shared/flash/flash';
import { FlashToaster } from '@/modules/shared/flash/FlashToaster';
import { AdminShell } from '@/modules/shared/ui/AdminShell';
import { MENU_REGISTRY } from '@/modules/shared/menu/menu-registry';

export const metadata = {
  title: 'TravelDemo - Panel Administrativo',
  description: 'Gestión operativa y comercial para agencias de viajes',
};

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUserWithRole();
  const flash = await readFlash();

  // Si no hay usuario autenticado (ej. en /admin/login), renderizar a pantalla completa clara
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center">
        <FlashToaster flash={flash} />
        {children}
      </div>
    );
  }

  // Filtrar ítems de menú según permisos del rol
  const allowedChecks = await Promise.all(
    MENU_REGISTRY.map(async (item) => {
      const allowed = await hasPermission(item.permission);
      return allowed ? item.id : null;
    })
  );
  const allowedItemIds = allowedChecks.filter((id): id is string => id !== null);

  return (
    <AdminShell
      user={user}
      roleName={user.roleName}
      allowedItemIds={allowedItemIds}
      flash={flash}
    >
      {children}
    </AdminShell>
  );
}
