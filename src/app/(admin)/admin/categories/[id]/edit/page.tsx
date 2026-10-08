import { notFound } from 'next/navigation';
import { guardPage } from '@/modules/shared/auth/require-permission';
import { createCategoryContainer } from '@/modules/category/container';
import { toCategoryDto } from '@/modules/category/serializers/category.serializer';
import { CategoryForm } from '@/modules/category/ui/CategoryForm';
import { Tag } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  await guardPage('categories.update');
  const { id } = await params;

  const container = createCategoryContainer();
  let category;
  try {
    const row = await container.findService.execute(id);
    category = toCategoryDto(row);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Editar Categoría: {category.name}</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Actualiza los datos, icono o imágenes de la categoría turística ({category.code}).
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}
