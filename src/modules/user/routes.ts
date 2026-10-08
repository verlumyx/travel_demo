export const UserRoutes = {
  base: '/admin/users',
  create: '/admin/users/create',
  edit: (id: string) => `/admin/users/${id}/edit`,
  view: (id: string) => `/admin/users/${id}`,
};
