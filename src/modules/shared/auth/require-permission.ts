import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ForbiddenError } from '@/modules/shared/exceptions/domain-error';

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export const hasPermission = cache(async (action: string): Promise<boolean> => {
  const user = await getSessionUser();
  if (!user) return false;

  // Role with permissionType === 'all' passes every check (superadmin)
  const role = (user as Record<string, unknown>).role as
    | { permissionType: string; permissions: string[] }
    | undefined;
  if (!role) return false;
  if (role.permissionType === 'all') return true;

  const perms = role.permissions || [];
  if (perms.includes(action)) return true;

  const [mod, act] = action.includes('.') ? action.split('.') : [];
  if (mod && act) {
    if (perms.includes(`${act}_${mod}`)) return true;
    if (act === 'list' && perms.includes(`read_${mod}`)) return true;
  }
  return false;
});

/** For server actions: throws, the action returns an error state. */
export async function requirePermission(action: string): Promise<void> {
  if (!(await hasPermission(action))) throw new ForbiddenError(action);
}

/** For pages: a Server Component cannot set cookies, so it redirects. */
export async function guardPage(action: string): Promise<never | void> {
  if (!(await hasPermission(action))) redirect('/admin?error=forbidden');
}
