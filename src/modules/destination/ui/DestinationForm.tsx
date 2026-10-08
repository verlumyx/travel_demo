'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createDestinationAction, updateDestinationAction } from '@/app/(admin)/admin/destinations/actions';
import type { DestinationDto } from '../serializers/destination.serializer';
import { destinationRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, MapPin } from 'lucide-react';

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
    <form action={formAction} className="space-y-8 max-w-3xl">
      {!isEditing && <input type="hidden" name="id" value={newId} />}

      {state.message && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {state.message}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" />
          Información del Destino
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Nombre del Destino <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: Archipiélago Los Roques, Roraima"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-rose-400">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Categoría Turística
            </label>
            <select
              name="categoryId"
              defaultValue={destination?.categoryId || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition"
            >
              <option value="">-- Sin categoría asignada --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            {state.fieldErrors?.categoryId && (
              <p className="text-xs text-rose-400">{state.fieldErrors.categoryId[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Slug URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="los-roques"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono transition"
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-rose-400">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              URL de Imagen
            </label>
            <input
              type="url"
              name="imageUrl"
              defaultValue={destination?.imageUrl || ''}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            {state.fieldErrors?.imageUrl && (
              <p className="text-xs text-rose-400">{state.fieldErrors.imageUrl[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Estado / Región
            </label>
            <input
              type="text"
              name="state"
              defaultValue={destination?.state || ''}
              placeholder="Ej: Falcón, Bolívar, Mérida"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Ciudad / Municipio
            </label>
            <input
              type="text"
              name="city"
              defaultValue={destination?.city || ''}
              placeholder="Ej: Chichiriviche, Santa Elena"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              País
            </label>
            <input
              type="text"
              name="country"
              defaultValue={destination?.country || 'Venezuela'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Descripción y Atractivos
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={destination?.description || ''}
            placeholder="Detalles sobre el clima, actividades recomendadas, atractivos naturales..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href={destinationRoutes.list()}
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
          {isEditing ? 'Guardar Cambios' : 'Crear Destino'}
        </button>
      </div>
    </form>
  );
}
