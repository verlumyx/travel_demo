export const transportUnitRoutes = {
  list: () => '/admin/transport-units',
  create: () => '/admin/transport-units/create',
  show: (id: string) => `/admin/transport-units/${id}`,
  edit: (id: string) => `/admin/transport-units/${id}/edit`,
  admin: {
    base: '/admin/transport-units',
    create: '/admin/transport-units/create',
    edit: (id: string) => `/admin/transport-units/${id}/edit`,
    view: (id: string) => `/admin/transport-units/${id}`,
  },
};
