'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
} from '@/app/(admin)/admin/payment-methods/actions';
import type { PaymentMethodDto } from '../serializers/payment-method.serializer';
import { paymentMethodRoutes } from '../routes';
import { Select2 } from '@/components/ui/select2';
import { Loader2, ArrowLeft, Save, Building, Coins } from 'lucide-react';

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethodDto;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - Dólares Americanos' },
  { value: 'VES', label: 'VES - Bolívares' },
  { value: 'EUR', label: 'EUR - Euros' },
  { value: 'USDT', label: 'USDT - Tether (Binance / Cripto)' },
];

export function PaymentMethodForm({ paymentMethod }: PaymentMethodFormProps) {
  const isEditing = Boolean(paymentMethod);
  const action = isEditing && paymentMethod
    ? updatePaymentMethodAction.bind(null, paymentMethod.id)
    : createPaymentMethodAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);
  const [newId] = useState(() => (!isEditing ? uuidv7() : ''));
  const [currency, setCurrency] = useState(paymentMethod?.currency || 'USD');

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {!isEditing && <input type="hidden" name="id" value={newId} />}
      <input type="hidden" name="currency" value={currency} />

      {state.message && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            state.status === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-teal-600" />
            Configuración del Método de Pago
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Los datos configurados aquí serán los que se le presentarán al cliente al momento de reservar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700">
              Nombre del Método de Pago *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={paymentMethod?.name || ''}
              placeholder="Ej: Pago Móvil Banesco, Zelle Principal, Efectivo en Taquilla"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-600">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Moneda */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="currencySelect" className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-slate-400" />
              Moneda Receptora *
            </label>
            <Select2
              id="currencySelect"
              value={currency}
              defaultValue={currency}
              options={CURRENCY_OPTIONS}
              onValueChange={(val) => setCurrency(val || 'USD')}
              size="md"
            />
            {state.fieldErrors?.currency && (
              <p className="text-xs text-rose-600">{state.fieldErrors.currency[0]}</p>
            )}
          </div>

          {/* Text Area para Instrucciones y Datos Bancarios */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="instructions" className="block text-xs font-semibold text-slate-700">
              Datos Bancarios e Instrucciones de Pago (Textarea) *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={6}
              required
              defaultValue={paymentMethod?.instructions || ''}
              placeholder={`Ejemplo:\nBanco: Banesco (0134)\nTeléfono: 0414-1234567\nRIF / C.I.: J-50000000-0\nTitular: Travel Agency C.A.\n\nNota: Por favor adjunte su comprobante digital tras transferir.`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition resize-y leading-relaxed"
            />
            <p className="text-xs text-slate-400">
              Este texto se mostrará tal como lo formatees con saltos de línea al viajero en el paso de pago de la reserva.
            </p>
            {state.fieldErrors?.instructions && (
              <p className="text-xs text-rose-600">{state.fieldErrors.instructions[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href={paymentMethodRoutes.list()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing ? 'Actualizar Método' : 'Crear Método de Pago'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
