export const DESTINATION_MODULE = {
  id: 'destinations',
  label: 'Gestión de Destinations',
  permissions: [
    'create',
    'read',
    'update',
    'delete',
  ].map(action => `${action}_destinations`),
};
