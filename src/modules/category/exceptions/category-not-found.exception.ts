import { NotFoundError } from '@/modules/shared/exceptions/domain-error';

export class CategoryNotFoundException extends NotFoundError {
  constructor(id: string) {
    super(`Categoría con ID ${id} no encontrada.`);
  }
}
