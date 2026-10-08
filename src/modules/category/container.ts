import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db as defaultDb } from '@/db/client';
import { DrizzleCategoryRepository } from './repositories/drizzle-category.repository';
import { CategoryCreateService } from './services/category-create.service';
import { CategoryUpdateService } from './services/category-update.service';
import { CategoryUpdateStatusService } from './services/category-update-status.service';
import { CategoryFindService } from './services/category-find.service';
import { CategorySearchService } from './services/category-search.service';

export function createCategoryContainer(db: DbExecutor = defaultDb) {
  const repository = new DrizzleCategoryRepository(db);

  return {
    repository,
    createService: new CategoryCreateService(repository),
    updateService: new CategoryUpdateService(repository),
    updateStatusService: new CategoryUpdateStatusService(repository),
    findService: new CategoryFindService(repository),
    searchService: new CategorySearchService(repository),
  };
}
