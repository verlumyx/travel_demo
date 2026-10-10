import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createPaymentMethodContainer } from '@/modules/payment-method/container';
import { toPaymentMethodDto } from '@/modules/payment-method/serializers/payment-method.serializer';
import { PaymentMethodForm } from '@/modules/payment-method/ui/PaymentMethodForm';
import { WalletCards } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaymentMethodPage({ params }: PageProps) {
  await guardPage('payment-methods.update');
  const { id } = await params;

  const container = createPaymentMethodContainer();
  let paymentMethod;
  try {
    const row = await container.findService.execute(id);
    paymentMethod = toPaymentMethodDto(row);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <WalletCards className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Editar Método de Pago: {paymentMethod.name}
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Actualiza los datos, moneda o coordenadas bancarias ({paymentMethod.code}).
        </p>
      </div>

      <PaymentMethodForm paymentMethod={paymentMethod} />
    </div>
  );
}
