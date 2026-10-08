export const paymentRoutes = {
  admin: {
    base: '/admin/payments',
    create: '/admin/payments/create',
    edit: (id: string) => `/admin/payments/${id}/edit`,
    view: (id: string) => `/admin/payments/${id}`
  }
};
