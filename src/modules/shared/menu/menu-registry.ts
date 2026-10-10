export type MenuEntry = {
  id: string;
  label: string;
  url: string;
  permission: string;
  icon: string;
  order: number;
  section: 'main' | 'config';
};

/**
 * Sidebar entries - single source of truth for the menu.
 * A module without a menu entry is unreachable.
 */
export const MENU_REGISTRY: MenuEntry[] = [
  // === Main Section ===
  { id: 'categories', label: 'Categorías', url: '/admin/categories', permission: 'categories.list', icon: 'Tag', order: 10, section: 'main' },
  { id: 'destinations', label: 'Destinos', url: '/admin/destinations', permission: 'destinations.list', icon: 'MapPin', order: 15, section: 'main' },
  { id: 'tours', label: 'Tours', url: '/admin/tours', permission: 'tours.list', icon: 'Compass', order: 20, section: 'main' },
  { id: 'departures', label: 'Salidas', url: '/admin/departures', permission: 'departures.list', icon: 'CalendarDays', order: 30, section: 'main' },
  { id: 'transport-units', label: 'Unidades', url: '/admin/transport-units', permission: 'transport-units.list', icon: 'Bus', order: 40, section: 'main' },
  { id: 'bookings', label: 'Reservas', url: '/admin/bookings', permission: 'bookings.list', icon: 'Ticket', order: 50, section: 'main' },
  { id: 'payments', label: 'Pagos', url: '/admin/payments', permission: 'payments.list', icon: 'CreditCard', order: 60, section: 'main' },
  { id: 'customers', label: 'Clientes', url: '/admin/customers', permission: 'customers.list', icon: 'Users', order: 70, section: 'main' },

  // === Config Section ===
  { id: 'users', label: 'Usuarios', url: '/admin/users', permission: 'users.list', icon: 'UserCog', order: 100, section: 'config' },
  { id: 'roles', label: 'Roles', url: '/admin/roles', permission: 'roles.list', icon: 'Shield', order: 110, section: 'config' },
];
