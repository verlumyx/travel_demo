import { getAuthenticatedCustomer } from '@/modules/customer/auth/customer-session';
import { CustomerNav } from '@/modules/customer/ui/CustomerNav';

export const instant = false;

export default async function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthenticatedCustomer();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {session && (
        <CustomerNav
          customerName={`${session.customer.firstName} ${session.customer.lastName}`}
          customerCode={session.customer.code}
        />
      )}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
