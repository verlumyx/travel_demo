export const bookingRoutes = {
  admin: {
    base: '/admin/bookings',
    create: '/admin/bookings/create',
    edit: (id: string) => `/admin/bookings/${id}/edit`,
    view: (id: string) => `/admin/bookings/${id}`
  }
};
