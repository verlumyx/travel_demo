import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getAuthenticatedCustomer } from '@/modules/customer/auth/customer-session';
import { CustomerLoginForm } from '@/modules/customer/ui/CustomerLoginForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const instant = false;

export default async function CustomerLoginPage() {
  await connection();
  const session = await getAuthenticatedCustomer();
  if (session) {
    redirect('/cuenta/reservas');
  }

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-lg mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la página principal
        </Link>
      </div>

      <CustomerLoginForm />
    </div>
  );
}
