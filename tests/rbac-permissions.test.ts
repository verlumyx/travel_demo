import { describe, it, expect } from 'vitest';

describe('RBAC Granular Permissions Matrix', () => {
  const checkPermission = (
    role: { permissionType: 'all' | 'custom'; permissions: string[] },
    action: string,
  ): boolean => {
    if (role.permissionType === 'all') return true;

    const perms = role.permissions || [];
    if (perms.includes(action)) return true;

    const [mod, act] = action.includes('.') ? action.split('.') : [];
    if (mod && act) {
      if (perms.includes(`${act}_${mod}`)) return true;
      if (act === 'list' && perms.includes(`read_${mod}`)) return true;
      if (act === 'show' && (perms.includes(`read_${mod}`) || perms.includes(`${mod}.read`))) return true;
      if (act === 'read' && (perms.includes(`${mod}.list`) || perms.includes(`${mod}.show`))) return true;
    }

    return false;
  };

  const adminRole = {
    name: 'Admin',
    permissionType: 'all' as const,
    permissions: [] as string[],
  };

  const operatorRole = {
    name: 'Operador',
    permissionType: 'custom' as const,
    permissions: [
      'categories.list', 'categories.create', 'categories.show', 'categories.update', 'categories.update-status',
      'destinations.list', 'destinations.create', 'destinations.show', 'destinations.update', 'destinations.update-status',
      'tours.list', 'tours.create', 'tours.show', 'tours.update', 'tours.update-status',
      'departures.list', 'departures.create', 'departures.show', 'departures.update', 'departures.update-status',
      'transport-units.list', 'transport-units.create', 'transport-units.show', 'transport-units.update', 'transport-units.update-status',
      'customers.list', 'customers.create', 'customers.show', 'customers.update', 'customers.update-status',
      'bookings.list', 'bookings.create', 'bookings.show', 'bookings.update', 'bookings.update-status',
      'payments.list', 'payments.create', 'payments.show', 'payments.update', 'payments.update-status',
    ],
  };

  const salesAgentRole = {
    name: 'Agente de Ventas',
    permissionType: 'custom' as const,
    permissions: [
      'categories.list', 'categories.show',
      'destinations.list', 'destinations.show',
      'tours.list', 'tours.show',
      'departures.list', 'departures.show',
      'customers.list', 'customers.show', 'customers.create',
      'bookings.list', 'bookings.show', 'bookings.create',
      'payments.list', 'payments.show', 'payments.create',
    ],
  };

  describe('Admin Role', () => {
    it('should have full permission for everything including users and roles', () => {
      expect(checkPermission(adminRole, 'users.list')).toBe(true);
      expect(checkPermission(adminRole, 'roles.list')).toBe(true);
      expect(checkPermission(adminRole, 'tours.update')).toBe(true);
      expect(checkPermission(adminRole, 'payments.update-status')).toBe(true);
      expect(checkPermission(adminRole, 'anything.custom')).toBe(true);
    });
  });

  describe('Operador Role', () => {
    it('should be able to manage catalog, departures, bookings, and payments', () => {
      expect(checkPermission(operatorRole, 'tours.create')).toBe(true);
      expect(checkPermission(operatorRole, 'tours.update')).toBe(true);
      expect(checkPermission(operatorRole, 'departures.create')).toBe(true);
      expect(checkPermission(operatorRole, 'payments.update-status')).toBe(true);
      expect(checkPermission(operatorRole, 'bookings.update-status')).toBe(true);
    });

    it('should NOT have access to user management or role management', () => {
      expect(checkPermission(operatorRole, 'users.list')).toBe(false);
      expect(checkPermission(operatorRole, 'users.create')).toBe(false);
      expect(checkPermission(operatorRole, 'roles.list')).toBe(false);
    });
  });

  describe('Agente de Ventas Role', () => {
    it('should be able to view tours, departures, and create bookings and payments', () => {
      expect(checkPermission(salesAgentRole, 'tours.list')).toBe(true);
      expect(checkPermission(salesAgentRole, 'departures.list')).toBe(true);
      expect(checkPermission(salesAgentRole, 'customers.create')).toBe(true);
      expect(checkPermission(salesAgentRole, 'bookings.create')).toBe(true);
      expect(checkPermission(salesAgentRole, 'payments.create')).toBe(true);
    });

    it('should NOT be able to modify tours', () => {
      expect(checkPermission(salesAgentRole, 'tours.update')).toBe(false);
      expect(checkPermission(salesAgentRole, 'tours.update-status')).toBe(false);
      expect(checkPermission(salesAgentRole, 'tours.create')).toBe(false);
    });

    it('should NOT be able to approve or reject payments', () => {
      expect(checkPermission(salesAgentRole, 'payments.update-status')).toBe(false);
      expect(checkPermission(salesAgentRole, 'payments.update')).toBe(false);
    });

    it('should NOT have access to user management or role management', () => {
      expect(checkPermission(salesAgentRole, 'users.list')).toBe(false);
      expect(checkPermission(salesAgentRole, 'roles.list')).toBe(false);
    });
  });
});
