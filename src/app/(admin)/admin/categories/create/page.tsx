import { guardPage } from '@/modules/shared/auth/require-permission';
import { CategoryForm } from '@/modules/category/ui/CategoryForm';
import { Tag } from 'lucide-react';

export const instant = false;

export default async function CreateCategoryPage() {
  await guardPage('categories.create');

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Nueva Categoría Turística</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Crea una nueva clasificación geográfica o temática para agrupar destinos en el catálogo.
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
