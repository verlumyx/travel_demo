export const categoryRoutes = {
  list: () => '/admin/categories',
  create: () => '/admin/categories/create',
  show: (id: string) => `/admin/categories/${id}`,
  edit: (id: string) => `/admin/categories/${id}/edit`,
};
