import { redirect } from 'next/navigation';
import { getSessionUserWithRole } from '@/modules/shared/auth/require-permission';
import { AdminLoginForm } from './AdminLoginForm';

export const instant = false;

export default async function AdminLoginPage() {
  const user = await getSessionUserWithRole();
  if (user) {
    redirect('/admin');
  }

  return (
    <div className="w-full flex items-center justify-center min-h-[85vh]">
      <AdminLoginForm />
    </div>
  );
}
