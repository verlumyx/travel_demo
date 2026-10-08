export const ROLE_MODULE = {
  id: 'roles',
  label: 'Gestión de Roles',
  permissions: [
    'create',
    'read',
    'update',
    'delete',
  ].map(action => `${action}_roles`),
};
