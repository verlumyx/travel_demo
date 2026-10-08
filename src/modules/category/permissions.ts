export const CATEGORY_MODULE = {
  id: 'categories',
  label: 'Gestión de Categorías',
  permissions: [
    'create',
    'read',
    'update',
    'delete',
  ].map(action => `${action}_categories`),
};
