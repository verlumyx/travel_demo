'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createTransportUnitAction, updateTransportUnitAction } from '@/app/(admin)/admin/transport-units/actions';
import type { TransportUnitDto } from '../serializers/transport-unit.serializer';
import { transportUnitRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, Bus } from 'lucide-react';

interface TransportUnitFormProps {
  unit?: TransportUnitDto;
}

export function TransportUnitForm({ unit }: TransportUnitFormProps) {
  const isEditing = Boolean(unit);
  const action = isEditing && unit
    ? updateTransportUnitAction.bind(null, unit.id)
    : createTransportUnitAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);
  const [newId] = useState(() => (!isEditing ? uuidv7() : ''));

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      {!isEditing && <input type="hidden" name="id" value={newId} />}

      {state.message && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {state.message}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Bus className="h-4 w-4 text-emerald-400" />
          Ficha Técnica de la Unidad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Nombre / Identificador Interno <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={unit?.name || ''}
              placeholder="Ej: Autobús Marcopolo 01, Van Ejecutiva"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-400">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Tipo de Vehículo <span className="text-rose-400">*</span>
            </label>
            <select
              name="type"
              defaultValue={unit?.type || 'bus'}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition"
            >
              <option value="bus">Autobús (Bus)</option>
              <option value="minibus">Minibús</option>
              <option value="van">Van / Camioneta</option>
              <option value="boat">Lancha / Embarcación</option>
              <option value="other">Otro</option>
            </select>
            {state.fieldErrors?.type && (
              <p className="text-xs text-rose-400">{state.fieldErrors.type[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Capacidad de Pasajeros <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              min={1}
              max={300}
              defaultValue={unit?.capacity || 32}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            {state.fieldErrors?.capacity && (
              <p className="text-xs text-rose-400">{state.fieldErrors.capacity[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Placa / Matrícula
            </label>
            <input
              type="text"
              name="plateNumber"
              defaultValue={unit?.plateNumber || ''}
              placeholder="Ej: AA123BB"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm uppercase font-mono transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Conductor Habitual
            </label>
            <input
              type="text"
              name="driverName"
              defaultValue={unit?.driverName || ''}
              placeholder="Nombre del chofer responsable"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Teléfono del Conductor
            </label>
            <input
              type="text"
              name="driverPhone"
              defaultValue={unit?.driverPhone || ''}
              placeholder="+58 412 1234567"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Notas de Mantenimiento / Observaciones
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={unit?.notes || ''}
            placeholder="Equipamiento, aire acondicionado, revisión técnica al día..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href={transportUnitRoutes.list()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-sm font-medium transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditing ? 'Guardar Cambios' : 'Registrar Unidad'}
        </button>
      </div>
    </form>
  );
}
