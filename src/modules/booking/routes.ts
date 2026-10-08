export const bookingRoutes = {
  list: () => '/admin/bookings',
  create: () => '/admin/bookings/create',
  show: (id: string) => `/admin/bookings/${id}`,
  edit: (id: string) => `/admin/bookings/${id}/edit`,
};
