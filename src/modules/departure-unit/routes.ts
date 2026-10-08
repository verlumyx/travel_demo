export const departureUnitRoutes = {
  admin: {
    base: '/admin/departure-units',
    create: '/admin/departure-units/new',
    edit: (id: string) => `/admin/departure-units/${id}/edit`,
    view: (id: string) => `/admin/departure-units/${id}`,
  },
};
