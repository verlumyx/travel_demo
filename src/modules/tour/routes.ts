export const TourRoutes = {
  base: '/admin/tours',
  create: '/admin/tours/create',
  edit: (id: string) => `/admin/tours/${id}/edit`,
  view: (id: string) => `/admin/tours/${id}`,
};
