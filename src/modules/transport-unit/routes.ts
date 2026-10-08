export const transportUnitRoutes = {
  admin: {
    base: '/admin/transport-units',
    create: '/admin/transport-units/new',
    edit: (id: string) => `/admin/transport-units/${id}/edit`,
    view: (id: string) => `/admin/transport-units/${id}`,
  },
};
