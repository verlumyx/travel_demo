'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createDestinationAction, updateDestinationAction } from '@/app/(admin)/admin/destinations/actions';
import type { DestinationDto } from '../serializers/destination.serializer';
import { destinationRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, MapPin } from 'lucide-react';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';

interface DestinationFormProps {
  destination?: DestinationDto;
  categories: { id: string; name: string; code: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function DestinationForm({ destination, categories }: DestinationFormProps) {
  const isEditing = Boolean(destination);
  const action = isEditing && destination
    ? updateDestinationAction.bind(null, destination.id)
    : createDestinationAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);
  const [name, setName] = useState(destination?.name || '');
  const [slug, setSlug] = useState(destination?.slug || '');
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
    <form action={formAction} className="space-y-6 max-w-3xl">
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
          <MapPin className="h-5 w-5 text-teal-600" />
          Información del Destino
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Nombre del Destino <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: Archipiélago Los Roques, Roraima"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Categoría Turística
            </label>
            <Select2
              name="categoryId"
              defaultValue={destination?.categoryId || ''}
              placeholder="-- Sin categoría asignada --"
              options={[
                { value: '', label: '-- Sin categoría asignada --' },
                ...categories.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.code})`,
                })),
              ]}
              size="md"
            />
            {state.fieldErrors?.categoryId && (
              <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.categoryId[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Slug URL <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="los-roques"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-mono transition"
          />
          {state.fieldErrors?.slug && (
            <p className="text-xs text-rose-500 mt-1">{state.fieldErrors.slug[0]}</p>
          )}
        </div>

        <ImageUpload
          name="imageUrl"
          defaultValue={destination?.imageUrl}
          folder="destinations"
          label="Fotografía del Destino"
          error={state.fieldErrors?.imageUrl?.[0]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Estado / Región
            </label>
            <input
              type="text"
              name="state"
              defaultValue={destination?.state || ''}
              placeholder="Ej: Falcón, Bolívar, Mérida"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              Ciudad / Municipio
            </label>
            <input
              type="text"
              name="city"
              defaultValue={destination?.city || ''}
              placeholder="Ej: Chichiriviche, Santa Elena"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">
              País
            </label>
            <input
              type="text"
              name="country"
              defaultValue={destination?.country || 'Venezuela'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 block">
            Descripción y Atractivos
          </label>
          <RichTextEditor
            name="description"
            defaultValue={destination?.description || ''}
            placeholder="Detalles sobre el clima, actividades recomendadas, atractivos naturales..."
            minHeight="min-h-[160px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={destinationRoutes.list()}
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
          {isEditing ? 'Guardar Cambios' : 'Crear Destino'}
        </button>
      </div>
    </form>
  );
}
