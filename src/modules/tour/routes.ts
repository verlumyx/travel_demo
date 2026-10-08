export const tourRoutes = {
  list: () => '/admin/tours',
  create: () => '/admin/tours/create',
  show: (id: string) => `/admin/tours/${id}`,
  edit: (id: string) => `/admin/tours/${id}/edit`,
};

export const TourRoutes = {
  base: '/admin/tours',
  create: '/admin/tours/create',
  edit: (id: string) => `/admin/tours/${id}/edit`,
  view: (id: string) => `/admin/tours/${id}`,
};
