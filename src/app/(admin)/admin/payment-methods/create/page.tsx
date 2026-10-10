import { guardPage } from '@/modules/shared/auth/require-permission';
import { PaymentMethodForm } from '@/modules/payment-method/ui/PaymentMethodForm';
import { WalletCards } from 'lucide-react';

export const instant = false;

export default async function CreatePaymentMethodPage() {
  await guardPage('payment-methods.create');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <WalletCards className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nuevo Método de Pago</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Crea una nueva cuenta o canal de pago y coloca las instrucciones bancarias que verá el viajero al reservar.
        </p>
      </div>

      <PaymentMethodForm />
    </div>
  );
}
