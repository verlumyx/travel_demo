'use client';

import { useActionState, useState } from 'react';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { createItineraryStopAction } from '@/app/(admin)/admin/tours/actions';
import { Plus, Loader2, MapPin, Moon } from 'lucide-react';

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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
      >
        <Plus className="h-4 w-4 text-emerald-400" />
        Agregar Parada al Itinerario
      </button>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" />
          Nueva Parada de Itinerario
        </h4>
        <button
          onClick={() => setIsOpen(false)}
          type="button"
          className="text-xs text-slate-400 hover:text-white"
        >
          Cerrar
        </button>
      </div>

      {state.message && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-300">
              Destino Visitado <span className="text-rose-400">*</span>
            </label>
            <select
              name="destinationId"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Selecciona un destino --</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {state.fieldErrors?.destinationId && (
              <p className="text-[11px] text-rose-400">{state.fieldErrors.destinationId[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Día Nº <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="dayNumber"
                min={1}
                defaultValue={defaultDayNumber}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Orden <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="sortOrder"
                min={0}
                defaultValue={1}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Título / Actividad de la Parada <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ej: Caminata al Salto Jaspe y baño refrescante"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
          {state.fieldErrors?.title && (
            <p className="text-[11px] text-rose-400">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Descripción de la Actividad
          </label>
          <textarea
            name="description"
            rows={2}
            placeholder="Detalles del trayecto, tiempos estimados, paradas para fotos..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="overnightStay"
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            Pernocta en este destino
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Guardar Parada
          </button>
        </div>
      </form>
    </div>
  );
}
