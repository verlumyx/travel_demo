'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { createCustomerAction, updateCustomerAction } from '@/app/(admin)/admin/customers/actions';
import { customerRoutes } from '../routes';
import type { CustomerRow } from '../models/customer.model';
import { uuidv7 } from '@/modules/shared/uuid';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface CustomerFormProps {
  initialData?: CustomerRow | null;
}

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const isEditing = Boolean(initialData);

  const action = isEditing
    ? updateCustomerAction.bind(null, initialData!.id)
    : createCustomerAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const generatedId = !isEditing ? uuidv7() : undefined;

  return (
    <form action={formAction} autoComplete="off" className="space-y-6 max-w-4xl">
      {!isEditing && <input type="hidden" name="id" value={generatedId} />}

      {state.message && (
        <div
          className={`p-4 rounded-lg text-sm border ${
            state.status === 'error'
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-3">
          Datos Personales y de Identificación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
              Nombres *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              defaultValue={initialData?.firstName ?? ''}
              placeholder="Ej: Carlos Eduardo"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.firstName && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.firstName[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
              Apellidos *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              defaultValue={initialData?.lastName ?? ''}
              placeholder="Ej: Mendoza Pérez"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.lastName && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.lastName[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-foreground mb-1.5">
              Tipo de Documento
            </label>
            <Select2
              id="documentType"
              name="documentType"
              defaultValue={initialData?.documentType ?? 'cedula'}
              options={[
                { value: 'cedula', label: 'Cédula de Identidad' },
                { value: 'passport', label: 'Pasaporte' },
                { value: 'other', label: 'Otro' },
              ]}
              size="sm"
            />
          </div>

          <div>
            <label htmlFor="documentNumber" className="block text-sm font-medium text-foreground mb-1.5">
              Número de Documento
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              defaultValue={initialData?.documentNumber ?? ''}
              placeholder="Ej: V-19456789"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.documentNumber && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.documentNumber[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-foreground mb-1.5">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              defaultValue={toDateInput(initialData?.birthDate)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.birthDate && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.birthDate[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={initialData?.email ?? ''}
              placeholder="carlos@ejemplo.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={initialData?.phone ?? ''}
              placeholder="+58 412 1234567"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.phone && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.phone[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact & Operational Notes */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-3">
          Contacto de Emergencia y Registro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-foreground mb-1.5">
              Nombre del Contacto de Emergencia
            </label>
            <input
              type="text"
              id="emergencyContact"
              name="emergencyContact"
              defaultValue={initialData?.emergencyContact ?? ''}
              placeholder="Ej: María Pérez (Madre)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="emergencyPhone" className="block text-sm font-medium text-foreground mb-1.5">
              Teléfono de Emergencia
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              name="emergencyPhone"
              defaultValue={initialData?.emergencyPhone ?? ''}
              placeholder="+58 414 7654321"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-foreground mb-1.5">
              Canal de Captación
            </label>
            <Select2
              id="source"
              name="source"
              defaultValue={initialData?.source ?? 'admin'}
              options={[
                { value: 'admin', label: 'Administración / Presencial' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'portal', label: 'Portal Web' },
              ]}
              size="sm"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
              Notas del Cliente
            </label>
            <RichTextEditor
              id="notes"
              name="notes"
              defaultValue={initialData?.notes ?? ''}
              placeholder="Alergias, restricciones alimenticias, preferencias de asiento, etc."
              minHeight="min-h-[130px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={isEditing ? customerRoutes.show(initialData!.id) : customerRoutes.list()}
          className="px-4 py-2 text-sm font-medium border border-input bg-background text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
        >
          {isPending
            ? isEditing
              ? 'Guardando cambios...'
              : 'Registrando cliente...'
            : isEditing
              ? 'Guardar Cambios'
              : 'Registrar Cliente'}
        </button>
      </div>
    </form>
  );
}
