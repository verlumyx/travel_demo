export const customerRoutes = {
  list: () => '/admin/customers',
  create: () => '/admin/customers/create',
  show: (id: string) => `/admin/customers/${id}`,
  edit: (id: string) => `/admin/customers/${id}/edit`,
};
