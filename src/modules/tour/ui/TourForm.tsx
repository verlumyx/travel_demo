'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createTourAction, updateTourAction } from '@/app/(admin)/admin/tours/actions';
import type { TourDto } from '../serializers/tour.serializer';
import { tourRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, Compass, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { NumberInput } from '@/components/ui/number-input';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';

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
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Compass className="h-4 w-4 text-teal-600" />
          Datos Principales del Tour
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nombre de la Experiencia / Paquete <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: Aventura Gran Sabana y Roraima 5D/4N"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition shadow-2xs"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-500">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Slug URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="gran-sabana-aventura"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-mono transition shadow-2xs"
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-rose-500">{state.fieldErrors.slug[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Duración (Días) <span className="text-rose-500">*</span>
            </label>
            <NumberInput
              name="durationDays"
              min={1}
              max={60}
              defaultValue={tour?.durationDays || 1}
              required
              className="h-10 rounded-xl bg-white border-slate-200 text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-teal-600" />
              Precio Base por Persona <span className="text-rose-500">*</span>
            </label>
            <CurrencyInput
              name="basePrice"
              defaultValue={tour?.basePrice ? parseFloat(tour.basePrice) : 150}
              min={0}
              required
              className="h-10 rounded-xl bg-white border-slate-200 text-slate-900"
            />
            {state.fieldErrors?.basePrice && (
              <p className="text-xs text-rose-500">{state.fieldErrors.basePrice[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Moneda
            </label>
            <Select2
              name="currency"
              defaultValue={tour?.currency || 'USD'}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'VES', label: 'VES (Bs.)' },
              ]}
              size="md"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Estado de Publicación
          </label>
          <Select2
            name="status"
            defaultValue={tour?.status || 'draft'}
            options={[
              { value: 'draft', label: 'Borrador (Oculto al público)' },
              { value: 'active', label: 'Activo (Visible en catálogo)' },
              { value: 'inactive', label: 'Inactivo (Deshabilitado)' },
            ]}
            size="md"
          />
        </div>

        <ImageUpload
          name="imageUrl"
          defaultValue={tour?.imageUrl}
          folder="tours"
          label="Imagen Promocional del Tour"
          error={state.fieldErrors?.imageUrl?.[0]}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Resumen Corto (Para tarjetas de catálogo)
          </label>
          <input
            type="text"
            name="shortDescription"
            maxLength={500}
            defaultValue={tour?.shortDescription || ''}
            placeholder="Breve llamada de atención de 1 o 2 líneas..."
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition shadow-2xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Descripción Detallada
          </label>
          <RichTextEditor
            name="description"
            defaultValue={tour?.description || ''}
            placeholder="Explicación completa de la experiencia, recomendaciones y condiciones..."
            minHeight="min-h-[160px]"
          />
        </div>
      </div>

      {/* Services and Inclusions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-teal-600" />
          Servicios Incluidos y Exclusiones
        </h3>

        <input type="hidden" name="includesFood" value={String(tour?.includesFood ?? false)} />
        <input type="hidden" name="includesLodging" value={String(tour?.includesLodging ?? false)} />

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Inclusiones del Paquete
            </label>
            <RichTextEditor
              name="inclusions"
              defaultValue={tour?.inclusions || ''}
              placeholder="Transporte ida y vuelta, hidratación, guías certificados, botiquín..."
              minHeight="min-h-[140px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Exclusiones del Paquete
            </label>
            <RichTextEditor
              name="exclusions"
              defaultValue={tour?.exclusions || ''}
              placeholder="Bebidas alcohólicas, souvenirs, propinas opcionales..."
              minHeight="min-h-[140px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href={tourRoutes.list()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 text-sm font-medium transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
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
