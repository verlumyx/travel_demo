export const itineraryStopRoutes = {
  admin: {
    base: '/admin/itinerary-stops',
    create: '/admin/itinerary-stops/new',
    edit: (id: string) => `/admin/itinerary-stops/${id}/edit`,
    view: (id: string) => `/admin/itinerary-stops/${id}`,
  },
};
