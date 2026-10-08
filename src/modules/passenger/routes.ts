export const passengerRoutes = {
  admin: {
    base: '/admin/passengers',
    create: '/admin/passengers/create',
    edit: (id: string) => `/admin/passengers/${id}/edit`,
    view: (id: string) => `/admin/passengers/${id}`
  }
};
