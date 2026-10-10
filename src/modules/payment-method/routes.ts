export const paymentMethodRoutes = {
  index: (query?: Record<string, string | number | undefined>) => {
    if (!query) return '/admin/payment-methods';
    const qs = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return qs ? `/admin/payment-methods?${qs}` : '/admin/payment-methods';
  },
  list: () => '/admin/payment-methods',
  create: () => '/admin/payment-methods/create',
  show: (id: string) => `/admin/payment-methods/${id}`,
  edit: (id: string) => `/admin/payment-methods/${id}/edit`,
};
