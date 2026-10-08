import { describe, it, expect, vi } from 'vitest';
import { BookingCapacityExceededException } from '@/modules/booking/exceptions/booking-capacity-exceeded.exception';
import { DomainError } from '@/modules/shared/exceptions/domain-error';

describe('Booking Capacity & Overbooking Prevention', () => {
  it('should reject booking when slotsReserved exceeds available capacity', () => {
    const departure = {
      id: 'dep-1',
      totalCapacity: 20,
      bookedSlots: 18,
      status: 'scheduled',
    };

    const requestedSlots = 3;
    const availableSlots = departure.totalCapacity - departure.bookedSlots;

    expect(requestedSlots).toBeGreaterThan(availableSlots);

    const validateCapacity = (dep: typeof departure, slots: number) => {
      if (dep.bookedSlots + slots > dep.totalCapacity) {
        throw new BookingCapacityExceededException(
          `No hay suficientes cupos disponibles en esta salida. Disponibles: ${dep.totalCapacity - dep.bookedSlots}, Solicitados: ${slots}.`
        );
      }
    };

    expect(() => validateCapacity(departure, requestedSlots)).toThrow(
      BookingCapacityExceededException
    );
  });

  it('should allow booking when slotsReserved fits exactly within capacity', () => {
    const departure = {
      id: 'dep-1',
      totalCapacity: 20,
      bookedSlots: 18,
      status: 'scheduled',
    };

    const requestedSlots = 2;

    const validateAndReserve = (dep: typeof departure, slots: number) => {
      if (dep.bookedSlots + slots > dep.totalCapacity) {
        throw new BookingCapacityExceededException('Cupos insuficientes');
      }
      return {
        ...dep,
        bookedSlots: dep.bookedSlots + slots,
      };
    };

    const updated = validateAndReserve(departure, requestedSlots);
    expect(updated.bookedSlots).toBe(20);
    expect(updated.bookedSlots).toBeLessThanOrEqual(updated.totalCapacity);
  });

  it('should reject booking on completed or cancelled departures', () => {
    const completedDeparture = {
      id: 'dep-2',
      totalCapacity: 20,
      bookedSlots: 10,
      status: 'completed',
    };

    const validateDepartureStatus = (dep: typeof completedDeparture) => {
      if (dep.status === 'completed' || dep.status === 'cancelled') {
        throw new DomainError('No se pueden crear reservas en una salida completada o cancelada.');
      }
    };

    expect(() => validateDepartureStatus(completedDeparture)).toThrow(DomainError);
  });
});
