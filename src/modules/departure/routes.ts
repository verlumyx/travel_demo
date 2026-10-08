export const departureRoutes = {
  admin: {
    base: '/admin/departures',
    create: '/admin/departures/new',
    edit: (id: string) => `/admin/departures/${id}/edit`,
    view: (id: string) => `/admin/departures/${id}`,
  },
};
