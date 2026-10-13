'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { createDepartureAction, updateDepartureAction } from '@/app/(admin)/admin/departures/actions';
import { departureRoutes } from '../routes';
import type { DepartureRow } from '../models/departure.model';
import { uuidv7 } from '@/modules/shared/uuid';
import { CurrencyInput } from '@/components/ui/currency-input';
import { NumberInput } from '@/components/ui/number-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface TourOption {
  id: string;
  name: string;
  code: string;
  durationDays: number;
  basePrice: string;
  currency: string;
}

interface DepartureFormProps {
  initialData?: DepartureRow | null;
  tours: TourOption[];
}

function toDateTimeLocal(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function DepartureForm({ initialData, tours }: DepartureFormProps) {
  const isEditing = Boolean(initialData);

  const action = isEditing
    ? updateDepartureAction.bind(null, initialData!.id)
    : createDepartureAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);

  // Generate a stable client-side UUID v7 for create
  const [newId] = useState(() => (!isEditing ? uuidv7() : ''));
  const [selectedTourId, setSelectedTourId] = useState<string>(initialData?.tourId ?? '');
  const selectedTour = tours.find((t) => t.id === selectedTourId);

  return (
    <form action={formAction} autoComplete="off" className="space-y-6 max-w-4xl">
      {!isEditing && <input type="hidden" name="id" value={newId} />}

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

      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="text-base font-semibold text-foreground border-b border-border pb-3">
          {isEditing ? 'Información General de la Salida' : 'Programación de la Salida'}
        </h2>

        {/* Tour Selection */}
        <div>
          <label htmlFor="tourId" className="block text-sm font-medium text-foreground mb-1.5">
            Tour / Experiencia *
          </label>
          <Select2
            id="tourId"
            name="tourId"
            required
            defaultValue={initialData?.tourId ?? ''}
            onValueChange={(val) => setSelectedTourId(val)}
            placeholder="Seleccione un tour..."
            options={tours.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.code}) - ${t.durationDays} día(s) - $${t.basePrice} ${t.currency}`,
            }))}
            size="sm"
          />
          {state.fieldErrors?.tourId && (
            <p className="text-xs text-destructive mt-1">{state.fieldErrors.tourId[0]}</p>
          )}
        </div>

        {/* Departure & Return Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="departureDate" className="block text-sm font-medium text-foreground mb-1.5">
              Fecha y Hora de Salida *
            </label>
            <input
              type="datetime-local"
              id="departureDate"
              name="departureDate"
              required
              defaultValue={toDateTimeLocal(initialData?.departureDate)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.departureDate && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.departureDate[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-foreground mb-1.5">
              Fecha y Hora Estimada de Retorno
            </label>
            <input
              type="datetime-local"
              id="returnDate"
              name="returnDate"
              defaultValue={toDateTimeLocal(initialData?.returnDate)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.returnDate && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.returnDate[0]}</p>
            )}
          </div>
        </div>

        {/* Meeting Point & Meeting Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="meetingPoint" className="block text-sm font-medium text-foreground mb-1.5">
              Punto de Encuentro
            </label>
            <input
              type="text"
              id="meetingPoint"
              name="meetingPoint"
              placeholder="Ej: Plaza Altamira, frente a la parada de Metro"
              defaultValue={initialData?.meetingPoint ?? ''}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.meetingPoint && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.meetingPoint[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="meetingTime" className="block text-sm font-medium text-foreground mb-1.5">
              Hora de Cita
            </label>
            <input
              type="text"
              id="meetingTime"
              name="meetingTime"
              placeholder="Ej: 05:30 AM"
              defaultValue={initialData?.meetingTime ?? ''}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hora recomendada para que los pasajeros lleguen al punto de encuentro.
            </p>
            {state.fieldErrors?.meetingTime && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.meetingTime[0]}</p>
            )}
          </div>
        </div>

        {/* Price Override */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priceOverride" className="block text-sm font-medium text-foreground mb-1.5">
              Precio Especial para esta Salida (Opcional)
            </label>
            <CurrencyInput
              id="priceOverride"
              name="priceOverride"
              defaultValue={
                initialData?.priceOverride && parseFloat(initialData.priceOverride) > 0
                  ? parseFloat(initialData.priceOverride)
                  : null
              }
              placeholder={
                selectedTour
                  ? `Precio base: $${selectedTour.basePrice} ${selectedTour.currency}`
                  : 'Sobrescribe el precio base del tour si aplica'
              }
              min={0}
              allowEmpty
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si se deja en blanco o en 0, se cobrará el precio base configurado en el tour{selectedTour ? ` ($${selectedTour.basePrice} ${selectedTour.currency})` : ''}.
            </p>
            {state.fieldErrors?.priceOverride && (
              <p className="text-xs text-destructive mt-1">{state.fieldErrors.priceOverride[0]}</p>
            )}
          </div>

          {!isEditing && (
            <div>
              <label htmlFor="totalCapacity" className="block text-sm font-medium text-foreground mb-1.5">
                Capacidad Inicial (Cupos)
              </label>
              <NumberInput
                id="totalCapacity"
                name="totalCapacity"
                min={0}
                defaultValue={0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                La capacidad se recalcula automáticamente conforme asigne unidades de transporte a esta salida.
              </p>
              {state.fieldErrors?.totalCapacity && (
                <p className="text-xs text-destructive mt-1">{state.fieldErrors.totalCapacity[0]}</p>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Notas Operativas
          </label>
          <RichTextEditor
            id="notes"
            name="notes"
            defaultValue={initialData?.notes ?? ''}
            placeholder="Instrucciones para el chofer, clima previsto, equipaje permitido, etc."
            minHeight="min-h-[140px]"
            error={Boolean(state.fieldErrors?.notes)}
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-destructive mt-1">{state.fieldErrors.notes[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={isEditing ? departureRoutes.show(initialData!.id) : departureRoutes.list()}
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
              : 'Creando salida...'
            : isEditing
              ? 'Guardar Cambios'
              : 'Programar Salida'}
        </button>
      </div>
    </form>
  );
}
