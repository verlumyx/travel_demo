export const RoleRoutes = {
  base: '/admin/roles',
  create: '/admin/roles/create',
  edit: (id: string) => `/admin/roles/${id}/edit`,
  view: (id: string) => `/admin/roles/${id}`,
};
