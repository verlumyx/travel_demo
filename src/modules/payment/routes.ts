export const paymentRoutes = {
  list: () => '/admin/payments',
  create: (bookingId?: string) =>
    bookingId ? `/admin/payments/create?bookingId=${bookingId}` : '/admin/payments/create',
  show: (id: string) => `/admin/payments/${id}`,
  edit: (id: string) => `/admin/payments/${id}/edit`,
  admin: {
    base: '/admin/payments',
    create: '/admin/payments/create',
    edit: (id: string) => `/admin/payments/${id}/edit`,
    view: (id: string) => `/admin/payments/${id}`,
  },
};
