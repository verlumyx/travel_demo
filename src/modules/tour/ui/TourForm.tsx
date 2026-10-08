'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createTourAction, updateTourAction } from '@/app/(admin)/admin/tours/actions';
import type { TourDto } from '../serializers/tour.serializer';
import { tourRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, Compass, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

interface TourFormProps {
  tour?: TourDto;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function TourForm({ tour }: TourFormProps) {
  const isEditing = Boolean(tour);
  const action = isEditing && tour
    ? updateTourAction.bind(null, tour.id)
    : createTourAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);
  const [name, setName] = useState(tour?.name || '');
  const [slug, setSlug] = useState(tour?.slug || '');
  const [slugModified, setSlugModified] = useState(isEditing);
  const [newId] = useState(() => (!isEditing ? uuidv7() : ''));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugModified) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugModified(true);
    setSlug(slugify(e.target.value));
  };

  return (
    <form action={formAction} className="space-y-8 max-w-4xl">
      {!isEditing && <input type="hidden" name="id" value={newId} />}

      {state.message && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {state.message}
        </div>
      )}

      {/* Basic Data */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Compass className="h-4 w-4 text-emerald-400" />
          Datos Principales del Tour
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Nombre de la Experiencia / Paquete <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: Aventura Gran Sabana y Roraima 5D/4N"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-400">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Slug URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="gran-sabana-aventura"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono transition"
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-rose-400">{state.fieldErrors.slug[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Duración (Días) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              name="durationDays"
              min={1}
              max={60}
              defaultValue={tour?.durationDays || 1}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Precio Base por Persona <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="basePrice"
              defaultValue={tour?.basePrice || '150.00'}
              placeholder="150.00"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-mono transition"
            />
            {state.fieldErrors?.basePrice && (
              <p className="text-xs text-rose-400">{state.fieldErrors.basePrice[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Moneda
            </label>
            <select
              name="currency"
              defaultValue={tour?.currency || 'USD'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="VES">VES (Bs.)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Estado de Publicación
            </label>
            <select
              name="status"
              defaultValue={tour?.status || 'draft'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition"
            >
              <option value="draft">Borrador (Oculto al público)</option>
              <option value="active">Activo (Visible en catálogo)</option>
              <option value="inactive">Inactivo (Deshabilitado)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              URL de Imagen Promocional
            </label>
            <input
              type="url"
              name="imageUrl"
              defaultValue={tour?.imageUrl || ''}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Resumen Corto (Para tarjetas de catálogo)
          </label>
          <input
            type="text"
            name="shortDescription"
            maxLength={500}
            defaultValue={tour?.shortDescription || ''}
            placeholder="Breve llamada de atención de 1 o 2 líneas..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Descripción Detallada
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={tour?.description || ''}
            placeholder="Explicación completa de la experiencia, recomendaciones y condiciones..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition resize-none"
          />
        </div>
      </div>

      {/* Services and Inclusions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          Servicios Incluidos y Exclusiones
        </h3>

        <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="inline-flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              name="includesFood"
              defaultChecked={tour?.includesFood || false}
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Incluye Comidas / Desayunos
          </label>

          <label className="inline-flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              name="includesLodging"
              defaultChecked={tour?.includesLodging || false}
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Incluye Alojamiento / Posada / Carpa
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Inclusiones del Paquete
            </label>
            <textarea
              name="inclusions"
              rows={3}
              defaultValue={tour?.inclusions || ''}
              placeholder="Transporte ida y vuelta, hidratación, guías certificados, botiquín..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Exclusiones del Paquete
            </label>
            <textarea
              name="exclusions"
              rows={3}
              defaultValue={tour?.exclusions || ''}
              placeholder="Bebidas alcohólicas, souvenirs, propinas opcionales..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href={tourRoutes.list()}
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
          {isEditing ? 'Guardar Cambios' : 'Crear Tour'}
        </button>
      </div>
    </form>
  );
}
