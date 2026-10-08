import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCustomerContainer } from '@/modules/customer/container';
import { CustomerForm } from '@/modules/customer/ui/CustomerForm';
import { Users } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: PageProps) {
  await guardPage('customers.update');
  const { id } = await params;

  const customerContainer = createCustomerContainer();

  let customer;
  try {
    customer = await customerContainer.findService.findOrFail(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
            Editar Cliente: {customer.code}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Actualice los datos personales, de contacto o de emergencia del cliente.
        </p>
      </div>

      <CustomerForm initialData={customer} />
    </div>
  );
}
