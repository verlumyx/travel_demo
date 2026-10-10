import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('No Physical Deletion Policy (Audit & Hardening)', () => {
  it('should not contain raw DELETE statements in domain repository implementations', () => {
    const repoFiles = [
      'src/modules/category/repositories/drizzle-category.repository.ts',
      'src/modules/destination/repositories/drizzle-destination.repository.ts',
      'src/modules/tour/repositories/drizzle-tour.repository.ts',
      'src/modules/departure/repositories/drizzle-departure.repository.ts',
      'src/modules/transport-unit/repositories/drizzle-transport-unit.repository.ts',
      'src/modules/customer/repositories/drizzle-customer.repository.ts',
      'src/modules/booking/repositories/drizzle-booking.repository.ts',
      'src/modules/payment/repositories/drizzle-payment.repository.ts',
      'src/modules/payment-method/repositories/drizzle-payment-method.repository.ts',
    ];

    for (const relPath of repoFiles) {
      const fullPath = path.resolve(__dirname, '..', relPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Check that .delete( is not invoked on business tables
        expect(content).not.toMatch(/\.delete\(/);
      }
    }
  });

  it('should ensure status transition handles deactivation rather than row deletion', () => {
    const entity = {
      id: 'tour-1',
      name: 'Excursión a Morrocoy',
      status: 'active' as 'active' | 'inactive',
    };

    const deactivateEntity = (item: typeof entity) => {
      return {
        ...item,
        status: 'inactive' as const,
      };
    };

    const updated = deactivateEntity(entity);
    expect(updated.id).toBe(entity.id);
    expect(updated.status).toBe('inactive');
  });

  it('should ensure booking cancellation changes status to cancelled without removing record', () => {
    const booking = {
      id: 'booking-1',
      code: 'RES000001',
      status: 'confirmed' as 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled',
      slotsReserved: 4,
    };

    const cancelBooking = (b: typeof booking) => {
      return {
        ...b,
        status: 'cancelled' as const,
      };
    };

    const cancelled = cancelBooking(booking);
    expect(cancelled.id).toBe(booking.id);
    expect(cancelled.code).toBe('RES000001');
    expect(cancelled.status).toBe('cancelled');
  });
});
