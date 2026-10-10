'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createTransportUnitAction, updateTransportUnitAction } from '@/app/(admin)/admin/transport-units/actions';
import type { TransportUnitDto } from '../serializers/transport-unit.serializer';
import { transportUnitRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, Bus } from 'lucide-react';
import { NumberInput } from '@/components/ui/number-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

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
    <form action={formAction} autoComplete="off" className="space-y-6 max-w-3xl">
      {!isEditing && <input type="hidden" name="id" value={newId} />}

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

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bus className="h-5 w-5 text-teal-600" />
          Ficha Técnica de la Unidad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Nombre / Identificador Interno <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={unit?.name || ''}
              placeholder="Ej: Autobús Marcopolo 01, Van Ejecutiva"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Tipo de Vehículo <span className="text-rose-500">*</span>
            </label>
            <Select2
              name="type"
              defaultValue={unit?.type || 'bus'}
              required
              options={[
                { value: 'bus', label: 'Autobús (Bus)' },
                { value: 'minibus', label: 'Minibús' },
                { value: 'van', label: 'Van / Camioneta' },
                { value: 'boat', label: 'Lancha / Embarcación' },
                { value: 'other', label: 'Otro' },
              ]}
              size="md"
            />
            {state.fieldErrors?.type && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.type[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Capacidad de Pasajeros <span className="text-rose-500">*</span>
            </label>
            <NumberInput
              name="capacity"
              min={1}
              max={300}
              defaultValue={unit?.capacity || 32}
              required
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-teal-500"
            />
            {state.fieldErrors?.capacity && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.capacity[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Placa / Matrícula
            </label>
            <input
              type="text"
              name="plateNumber"
              defaultValue={unit?.plateNumber || ''}
              placeholder="Ej: AA123BB"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm uppercase font-mono transition"
            />
            {state.fieldErrors?.plateNumber && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.plateNumber[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Conductor Habitual
            </label>
            <input
              type="text"
              name="driverName"
              defaultValue={unit?.driverName || ''}
              placeholder="Nombre del chofer responsable"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
            {state.fieldErrors?.driverName && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.driverName[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Teléfono del Conductor
            </label>
            <input
              type="text"
              name="driverPhone"
              defaultValue={unit?.driverPhone || ''}
              placeholder="+58 412 1234567"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
            {state.fieldErrors?.driverPhone && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.driverPhone[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Notas de Mantenimiento / Observaciones
          </label>
          <RichTextEditor
            name="notes"
            defaultValue={unit?.notes || ''}
            placeholder="Equipamiento, aire acondicionado, revisión técnica al día..."
            minHeight="min-h-[140px]"
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.notes[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={transportUnitRoutes.list()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-semibold text-sm transition shadow-xs cursor-pointer disabled:opacity-50"
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
