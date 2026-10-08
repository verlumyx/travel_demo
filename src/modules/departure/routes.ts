export const departureRoutes = {
  list: () => '/admin/departures',
  create: () => '/admin/departures/create',
  show: (id: string) => `/admin/departures/${id}`,
  edit: (id: string) => `/admin/departures/${id}/edit`,
};
