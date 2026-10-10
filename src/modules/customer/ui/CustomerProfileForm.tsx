'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { customerUpdateProfileAction } from '@/app/(catalogo)/cuenta/actions';
import type { CustomerDto } from '../serializers/customer.serializer';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowLeft,
  Save,
  FileText,
} from 'lucide-react';

interface CustomerProfileFormProps {
  customer: CustomerDto;
}

export function CustomerProfileForm({ customer }: CustomerProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    customerUpdateProfileAction,
    initialActionState,
  );

  const birthDateValue = customer.birthDate ? customer.birthDate.split('T')[0] : '';

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
            state.status === 'error'
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {state.status === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      {/* 1. Información Personal */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Datos Personales y de Contacto
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Tu nombre oficial como debe aparecer en los registros y listas de pasajeros.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-xs font-medium text-foreground block">
              Nombres <span className="text-destructive">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              defaultValue={customer.firstName}
              placeholder="Ej: Carlos Eduardo"
              className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.firstName && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.firstName[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-xs font-medium text-foreground block">
              Apellidos <span className="text-destructive">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              defaultValue={customer.lastName}
              placeholder="Ej: Mendoza Pérez"
              className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.lastName && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.lastName[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground block">
              Correo Electrónico (Acceso)
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                id="email"
                type="email"
                disabled
                defaultValue={customer.email || ''}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-input bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <Lock className="h-3.5 w-3.5 text-muted-foreground absolute right-3 top-3" />
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span>Vinculado a tu cuenta de acceso de viajero.</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-medium text-foreground block">
              Teléfono / WhatsApp de Contacto <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={customer.phone || ''}
                placeholder="+58 412 1234567"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
            {state.fieldErrors?.phone && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.phone[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Identificación y Fecha de Nacimiento */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Documento de Identidad y Nacimiento
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Información requerida para la verificación de seguros y controles en puntos turísticos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="documentType" className="text-xs font-medium text-foreground block">
              Tipo de Documento
            </label>
            <select
              id="documentType"
              name="documentType"
              defaultValue={customer.documentType || 'cedula'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="cedula">Cédula de Identidad</option>
              <option value="passport">Pasaporte</option>
              <option value="other">Otro Documento</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="documentNumber" className="text-xs font-medium text-foreground block">
              Número de Documento
            </label>
            <input
              id="documentNumber"
              name="documentNumber"
              type="text"
              defaultValue={customer.documentNumber || ''}
              placeholder="Ej: V-18456789 o Pasaporte"
              className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.documentNumber && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.documentNumber[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="birthDate" className="text-xs font-medium text-foreground block">
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={birthDateValue}
                className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
            {state.fieldErrors?.birthDate && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.birthDate[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Contacto de Emergencia */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Contacto de Emergencia
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Persona a la que podemos contactar en caso de cualquier eventualidad durante las excursiones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="emergencyContact" className="text-xs font-medium text-foreground block">
              Nombre y Parentesco
            </label>
            <input
              id="emergencyContact"
              name="emergencyContact"
              type="text"
              defaultValue={customer.emergencyContact || ''}
              placeholder="Ej: María Pérez (Madre / Cónyuge)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.emergencyContact && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.emergencyContact[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="emergencyPhone" className="text-xs font-medium text-foreground block">
              Teléfono de Emergencia
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                defaultValue={customer.emergencyPhone || ''}
                placeholder="+58 414 7654321"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
            {state.fieldErrors?.emergencyPhone && (
              <p className="text-[11px] text-destructive">{state.fieldErrors.emergencyPhone[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Preferencias y Salud */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Preferencias y Notas Especiales
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Alergias, restricciones dietéticas (vegetariano, sin gluten, etc.) o requerimientos especiales.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={customer.notes || ''}
            placeholder="Ejemplo: Alergia a mariscos / penicilina, preferencia por asientos delanteros en traslados terrestres..."
            className="w-full p-3 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring resize-y"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/cuenta/reservas"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition rounded-xl border border-border bg-card hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Mis Reservas
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando cambios...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}
