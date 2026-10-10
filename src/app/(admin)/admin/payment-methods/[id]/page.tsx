import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createPaymentMethodContainer } from '@/modules/payment-method/container';
import { toPaymentMethodDto } from '@/modules/payment-method/serializers/payment-method.serializer';
import { paymentMethodRoutes } from '@/modules/payment-method/routes';
import { PaymentMethodStatusBadge } from '@/modules/payment-method/ui/PaymentMethodStatusBadge';
import { PaymentMethodStatusToggle } from '@/modules/payment-method/ui/PaymentMethodStatusToggle';
import { ArrowLeft, Edit3, WalletCards, Calendar, Coins, Building } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentMethodDetailPage({ params }: PageProps) {
  await guardPage('payment-methods.show');
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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={paymentMethodRoutes.list()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Métodos de Pago
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{paymentMethod.name}</h1>
            <PaymentMethodStatusBadge status={paymentMethod.status} />
          </div>
          <p className="text-sm font-mono text-teal-700 mt-1">Código: {paymentMethod.code}</p>
        </div>

        <div className="flex items-center gap-3">
          <PaymentMethodStatusToggle id={paymentMethod.id} currentStatus={paymentMethod.status} />
          <Link
            href={paymentMethodRoutes.edit(paymentMethod.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 shadow-xs transition"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Details Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Moneda Receptora</span>
            <p className="text-sm font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-teal-600" />
              {paymentMethod.currency}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha de Creación</span>
            <p className="text-sm text-slate-700 mt-0.5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              {new Date(paymentMethod.createdAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Estado Operativo</span>
            <div className="mt-1">
              <PaymentMethodStatusBadge status={paymentMethod.status} />
            </div>
          </div>

          {paymentMethod.updatedAt && (
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Última Modificación</span>
              <p className="text-sm text-slate-700 mt-0.5 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {new Date(paymentMethod.updatedAt).toLocaleDateString('es-VE', { dateStyle: 'long' })}
              </p>
            </div>
          )}
        </div>

        {/* Text Area Instructions Box */}
        <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Building className="h-4 w-4 text-slate-500" />
            Datos Bancarios e Instrucciones Mostradas al Cliente:
          </span>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
            {paymentMethod.instructions}
          </div>
          <p className="text-[11px] text-slate-400">
            Vista previa del cuadro de datos que aparecerá en el portal de reserva al seleccionar este método de pago.
          </p>
        </div>
      </div>
    </div>
  );
}
