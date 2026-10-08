export const customerRoutes = {
  admin: {
    base: '/admin/customers',
    create: '/admin/customers/create',
    edit: (id: string) => `/admin/customers/${id}/edit`,
    view: (id: string) => `/admin/customers/${id}`
  }
};
