import { type SQL, and } from 'drizzle-orm';

export type FilterMap<_T = any> = Record<string, (value: string) => SQL | undefined>;

export function applyFilters(
  arg1: any,
  arg2?: any,
  arg3?: any,
): any {
  // If called as applyFilters(query, filters, map)
  if (arg3 !== undefined) {
    const query = arg1;
    const filters = arg2 || {};
    const map = arg3;
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue;
      const build = map[key];
      if (typeof build === 'function') {
        const cond = build(String(value));
        if (cond) conditions.push(cond);
      }
    }
    if (conditions.length > 0 && typeof query?.where === 'function') {
      return query.where(and(...conditions));
    }
    return query;
  }

  // If called as applyFilters(map, filters) or applyFilters(filters, map)
  let map: FilterMap;
  let filters: Record<string, unknown>;

  const firstValues = Object.values(arg1 || {});
  const isArg1Map = firstValues.some((v) => typeof v === 'function');

  if (isArg1Map) {
    map = arg1;
    filters = (arg2 || {}) as Record<string, unknown>;
  } else {
    filters = (arg1 || {}) as Record<string, unknown>;
    map = arg2 || {};
  }

  const conditions: SQL[] = [];
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '') continue;
    const build = map[key];
    if (typeof build === 'function') {
      const cond = build(String(value));
      if (cond) conditions.push(cond);
    }
  }

  return conditions;
}
