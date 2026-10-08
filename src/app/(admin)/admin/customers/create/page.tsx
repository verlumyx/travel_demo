import { guardPage } from '@/modules/shared/auth/require-permission';
import { CustomerForm } from '@/modules/customer/ui/CustomerForm';
import { Users } from 'lucide-react';

export const instant = false;

export default async function CreateCustomerPage() {
  await guardPage('customers.create');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Registrar Nuevo Cliente
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ingrese los datos personales, de contacto y de emergencia para el directorio CRM.
        </p>
      </div>

      <CustomerForm />
    </div>
  );
}
