import 'server-only';
import { redirect } from 'next/navigation';
import { getSessionUser } from './require-permission';

/**
 * Verifies the session user is authenticated.
 * Called once in the admin layout.
 */
export async function requireAuth(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
}
