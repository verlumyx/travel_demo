'use client';

import { useActionState, useState } from 'react';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { createItineraryStopAction } from '@/app/(admin)/admin/tours/actions';
import { Plus, Loader2, MapPin, Moon } from 'lucide-react';
import { NumberInput } from '@/components/ui/number-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface DestinationOption {
  id: string;
  name: string;
  code: string;
}

interface ItineraryStopFormProps {
  tourId: string;
  destinations: DestinationOption[];
  defaultDayNumber?: number;
}

export function ItineraryStopForm({
  tourId,
  destinations,
  defaultDayNumber = 1,
}: ItineraryStopFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const action = createItineraryStopAction.bind(null, tourId);
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-sm transition cursor-pointer"
      >
        <Plus className="h-4 w-4 text-teal-600" />
        Agregar Parada al Itinerario
      </button>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-teal-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" />
          Nueva Parada de Itinerario
        </h4>
        <button
          onClick={() => setIsOpen(false)}
          type="button"
          className="text-xs text-slate-400 hover:text-slate-700"
        >
          Cerrar
        </button>
      </div>

      {state.message && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700">
              Destino Visitado <span className="text-rose-500">*</span>
            </label>
            <Select2
              name="destinationId"
              required
              placeholder="-- Selecciona un destino --"
              options={destinations.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.code})`,
              }))}
              size="sm"
            />
            {state.fieldErrors?.destinationId && (
              <p className="text-[11px] text-rose-500">{state.fieldErrors.destinationId[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Día Nº <span className="text-rose-500">*</span>
              </label>
              <NumberInput
                name="dayNumber"
                min={1}
                defaultValue={defaultDayNumber}
                required
                className="h-9 rounded-xl bg-white border-slate-200 text-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Orden <span className="text-rose-500">*</span>
              </label>
              <NumberInput
                name="sortOrder"
                min={0}
                defaultValue={1}
                required
                className="h-9 rounded-xl bg-white border-slate-200 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Título / Actividad de la Parada <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ej: Caminata al Salto Jaspe y baño refrescante"
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
          />
          {state.fieldErrors?.title && (
            <p className="text-[11px] text-rose-500">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Descripción de la Actividad
          </label>
          <RichTextEditor
            name="description"
            placeholder="Detalles del trayecto, tiempos estimados, paradas para fotos..."
            minHeight="min-h-[110px]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="overnightStay"
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <Moon className="h-3.5 w-3.5 text-teal-600" />
            Pernocta en este destino
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Guardar Parada
          </button>
        </div>
      </form>
    </div>
  );
}
