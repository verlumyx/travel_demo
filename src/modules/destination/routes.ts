export const destinationRoutes = {
  list: () => '/admin/destinations',
  create: () => '/admin/destinations/create',
  show: (id: string) => `/admin/destinations/${id}`,
  edit: (id: string) => `/admin/destinations/${id}/edit`,
};

export const DestinationRoutes = {
  base: '/admin/destinations',
  create: '/admin/destinations/create',
  edit: (id: string) => `/admin/destinations/${id}/edit`,
  view: (id: string) => `/admin/destinations/${id}`,
};
