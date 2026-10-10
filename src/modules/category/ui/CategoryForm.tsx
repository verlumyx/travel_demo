'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { initialActionState } from '@/modules/shared/actions/action-state';
import { uuidv7 } from '@/modules/shared/uuid';
import { createCategoryAction, updateCategoryAction } from '@/app/(admin)/admin/categories/actions';
import type { CategoryDto } from '../serializers/category.serializer';
import { categoryRoutes } from '../routes';
import { Loader2, ArrowLeft, Save, Sparkles } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface CategoryFormProps {
  category?: CategoryDto;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryForm({ category }: CategoryFormProps) {
  const isEditing = Boolean(category);
  const action = isEditing && category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState(action, initialActionState);
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
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
          <Sparkles className="h-4 w-4 text-amber-400" />
          Datos Principales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Nombre de la Categoría <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej: Playa, Montaña, Selva"
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
              placeholder="ej: playa-y-sol"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono transition"
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-rose-400">{state.fieldErrors.slug[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Ícono identificador
            </label>
            <input
              type="text"
              name="icon"
              defaultValue={category?.icon || ''}
              placeholder="ej: waves, mountain, trees, droplets"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            <p className="text-xs text-slate-500">Nombre de icono Lucide (waves, mountain, trees, etc.)</p>
            {state.fieldErrors?.icon && (
              <p className="text-xs text-rose-400">{state.fieldErrors.icon[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              URL de Imagen Ilustrativa
            </label>
            <input
              type="url"
              name="imageUrl"
              defaultValue={category?.imageUrl || ''}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            {state.fieldErrors?.imageUrl && (
              <p className="text-xs text-rose-400">{state.fieldErrors.imageUrl[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Descripción
          </label>
          <RichTextEditor
            name="description"
            defaultValue={category?.description || ''}
            placeholder="Breve reseña sobre este tipo de destinos..."
            minHeight="min-h-[140px]"
            error={Boolean(state.fieldErrors?.description)}
          />
          {state.fieldErrors?.description && (
            <p className="text-xs text-rose-400">{state.fieldErrors.description[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href={categoryRoutes.list()}
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
          {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
        </button>
      </div>
    </form>
  );
}
