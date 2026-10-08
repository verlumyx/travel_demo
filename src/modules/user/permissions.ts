export const USER_MODULE = {
  id: 'users',
  label: 'Gestión de Users',
  permissions: [
    'create',
    'read',
    'update',
    'delete',
  ].map(action => `${action}_users`),
};
