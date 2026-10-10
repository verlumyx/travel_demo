import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getAuthenticatedCustomer } from '@/modules/customer/auth/customer-session';
import { createCustomerContainer } from '@/modules/customer/container';
import { CustomerLoginForm } from '@/modules/customer/ui/CustomerLoginForm';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export const instant = false;

export default async function CustomerLoginPage() {
  await connection();
  const session = await getAuthenticatedCustomer();
  if (session) {
    redirect('/cuenta/reservas');
  }

  const customerContainer = createCustomerContainer();
  const activeCustomers = await customerContainer.repository.getActive();

  const demoCustomers = activeCustomers
    .filter((c) => Boolean(c.email))
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      email: c.email!,
    }));

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la página principal
        </Link>
      </div>

      <CustomerLoginForm demoCustomers={demoCustomers} />
    </div>
  );
}
