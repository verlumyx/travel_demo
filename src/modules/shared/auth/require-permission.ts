import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db/client';
import { app_users } from '@/modules/user/models/user.model';
import { app_roles } from '@/modules/role/models/role.model';
import { eq, ilike } from 'drizzle-orm';
import { ForbiddenError } from '@/modules/shared/exceptions/domain-error';

export interface UserRoleInfo {
  id: string;
  name: string;
  permissionType: 'all' | 'custom';
  permissions: string[];
}

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export const getSessionUserWithRole = cache(async () => {
  const user = await getSessionUser();
  if (!user) return null;

  try {
    // 1. Try to find the user in app_users joined with app_roles
    const [appUser] = await db
      .select({
        user: app_users,
        role: app_roles,
      })
      .from(app_users)
      .innerJoin(app_roles, eq(app_users.roleId, app_roles.id))
      .where(eq(app_users.email, user.email))
      .limit(1);

    if (appUser) {
      return {
        ...user,
        roleName: appUser.role.name,
        roleInfo: {
          id: appUser.role.id,
          name: appUser.role.name,
          permissionType: appUser.role.permissionType,
          permissions: (appUser.role.permissions as string[]) || [],
        } satisfies UserRoleInfo,
      };
    }

    // 2. Fallback: match by session role string
    const sessionRole = (user as { role?: string }).role?.toLowerCase() || '';

    if (sessionRole === 'admin') {
      return {
        ...user,
        roleName: 'Admin',
        roleInfo: {
          id: 'admin',
          name: 'Admin',
          permissionType: 'all' as const,
          permissions: [],
        } satisfies UserRoleInfo,
      };
    }

    if (sessionRole) {
      const [matchedRole] = await db
        .select()
        .from(app_roles)
        .where(ilike(app_roles.name, `%${sessionRole}%`))
        .limit(1);

      if (matchedRole) {
        return {
          ...user,
          roleName: matchedRole.name,
          roleInfo: {
            id: matchedRole.id,
            name: matchedRole.name,
            permissionType: matchedRole.permissionType,
            permissions: (matchedRole.permissions as string[]) || [],
          } satisfies UserRoleInfo,
        };
      }
    }
  } catch (err) {
    console.error('Error resolving user role:', err);
  }

  // Default fallback for superadmin role check
  const isSuperadmin = (user as { role?: string }).role?.toLowerCase() === 'admin';
  return {
    ...user,
    roleName: isSuperadmin ? 'Admin' : 'Operador',
    roleInfo: {
      id: isSuperadmin ? 'admin' : 'operator',
      name: isSuperadmin ? 'Admin' : 'Operador',
      permissionType: isSuperadmin ? ('all' as const) : ('custom' as const),
      permissions: [],
    } satisfies UserRoleInfo,
  };
});

export const hasPermission = cache(async (action: string): Promise<boolean> => {
  const userWithRole = await getSessionUserWithRole();
  if (!userWithRole) return false;

  const role = userWithRole.roleInfo;
  if (!role) return false;

  // Superadmin with permissionType === 'all' passes every check
  if (role.permissionType === 'all') return true;

  const perms = role.permissions || [];
  if (perms.includes(action)) return true;

  // Normalization: allow 'tours.list' <-> 'read_tours' / 'list_tours'
  const [mod, act] = action.includes('.') ? action.split('.') : [];
  if (mod && act) {
    if (perms.includes(`${act}_${mod}`)) return true;
    if (act === 'list' && perms.includes(`read_${mod}`)) return true;
    if (act === 'show' && (perms.includes(`read_${mod}`) || perms.includes(`${mod}.read`))) return true;
    if (act === 'read' && (perms.includes(`${mod}.list`) || perms.includes(`${mod}.show`))) return true;
  }

  const [act2, mod2] = action.includes('_') ? action.split('_') : [];
  if (act2 && mod2) {
    if (perms.includes(`${mod2}.${act2}`)) return true;
    if (act2 === 'read' && (perms.includes(`${mod2}.list`) || perms.includes(`${mod2}.show`))) return true;
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

