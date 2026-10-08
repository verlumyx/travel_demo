import type { SQL } from 'drizzle-orm';

export type FilterMap = Record<string, (value: string) => SQL>;

export function applyFilters(map: FilterMap, filters: Record<string, unknown>): SQL[] {
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '') continue;
    const build = map[key];
    if (build) conditions.push(build(String(value)));
  }

  return conditions;
}
