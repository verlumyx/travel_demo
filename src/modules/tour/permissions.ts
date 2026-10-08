export const TOUR_MODULE = {
  id: 'tours',
  label: 'Gestión de Tours',
  permissions: [
    'create',
    'read',
    'update',
    'delete',
  ].map(action => `${action}_tours`),
};
