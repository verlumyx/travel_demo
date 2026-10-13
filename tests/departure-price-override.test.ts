import { describe, it, expect } from 'vitest';
import { CreateDepartureCommand } from '@/modules/departure/commands/create-departure.command';
import { UpdateDepartureCommand } from '@/modules/departure/commands/update-departure.command';
import { toDepartureDto, toScheduledDepartureDto } from '@/modules/departure/serializers/departure.serializer';
import type { DepartureRow } from '@/modules/departure/models/departure.model';
import type { ScheduledDeparturePublicItem } from '@/modules/departure/repositories/departure.repository';

describe('Departure Special Price (priceOverride) fallback behavior', () => {
  describe('CreateDepartureCommand.fromInput', () => {
    const baseInput = {
      id: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb1',
      tourId: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb2',
      departureDate: '2026-11-01T10:00:00Z',
      returnDate: '2026-11-02T18:00:00Z',
      meetingPoint: 'Plaza Central',
      meetingTime: '09:30',
      totalCapacity: 20,
      notes: null,
    };

    it('should set priceOverride to null when input is "0"', () => {
      const command = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '0',
      });
      expect(command.priceOverride).toBeNull();
    });

    it('should set priceOverride to null when input is "0.00"', () => {
      const command = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '0.00',
      });
      expect(command.priceOverride).toBeNull();
    });

    it('should set priceOverride to null when input is empty string', () => {
      const command = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '',
      });
      expect(command.priceOverride).toBeNull();
    });

    it('should set priceOverride to null when input is null or undefined', () => {
      const commandNull = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: null,
      });
      expect(commandNull.priceOverride).toBeNull();

      const commandUndefined = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: undefined,
      });
      expect(commandUndefined.priceOverride).toBeNull();
    });

    it('should retain priceOverride formatted as 2 decimals when a positive price is provided', () => {
      const command = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '185.50',
      });
      expect(command.priceOverride).toBe('185.50');

      const commandInteger = CreateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '200',
      });
      expect(commandInteger.priceOverride).toBe('200.00');
    });
  });

  describe('UpdateDepartureCommand.fromInput', () => {
    const baseInput = {
      tourId: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb2',
      departureDate: '2026-11-01T10:00:00Z',
      returnDate: null,
      meetingPoint: null,
      meetingTime: null,
      notes: null,
    };

    it('should set priceOverride to null when input is "0" or "0.00"', () => {
      const cmdZero = UpdateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '0',
      });
      expect(cmdZero.priceOverride).toBeNull();

      const cmdZeroDec = UpdateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '0.00',
      });
      expect(cmdZeroDec.priceOverride).toBeNull();
    });

    it('should set priceOverride to null when left blank or null', () => {
      const cmdEmpty = UpdateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '',
      });
      expect(cmdEmpty.priceOverride).toBeNull();

      const cmdNull = UpdateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: null,
      });
      expect(cmdNull.priceOverride).toBeNull();
    });

    it('should format positive special price with 2 decimals', () => {
      const cmd = UpdateDepartureCommand.fromInput({
        ...baseInput,
        priceOverride: '140',
      });
      expect(cmd.priceOverride).toBe('140.00');
    });
  });

  describe('Departure serializers normalization', () => {
    const mockRow: DepartureRow = {
      id: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb1',
      code: 'SAL000001',
      tourId: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb2',
      departureDate: new Date('2026-11-01T10:00:00Z'),
      returnDate: null,
      meetingPoint: 'Terminal',
      meetingTime: '08:00',
      priceOverride: '0.00',
      totalCapacity: 25,
      bookedSlots: 5,
      notes: null,
      status: 'scheduled',
      createdAt: new Date('2026-10-01T10:00:00Z'),
      updatedAt: null,
    };

    it('toDepartureDto should normalize "0.00" priceOverride to null so base price applies', () => {
      const dto = toDepartureDto(mockRow);
      expect(dto.priceOverride).toBeNull();
    });

    it('toDepartureDto should keep positive priceOverride intact', () => {
      const dto = toDepartureDto({
        ...mockRow,
        priceOverride: '175.00',
      });
      expect(dto.priceOverride).toBe('175.00');
    });

    it('toScheduledDepartureDto should normalize "0.00" priceOverride to null', () => {
      const mockItem: ScheduledDeparturePublicItem = {
        id: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb1',
        code: 'SAL000001',
        tourId: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb2',
        tourName: 'Tour Araya',
        tourSlug: 'tour-araya',
        tourCode: 'TUR000001',
        tourImageUrl: null,
        tourDurationDays: 1,
        tourShortDescription: null,
        tourBasePrice: '150.00',
        currency: 'USD',
        departureDate: new Date('2026-11-01T10:00:00Z'),
        returnDate: null,
        meetingPoint: null,
        meetingTime: null,
        priceOverride: '0.00',
        effectivePrice: '150.00',
        totalCapacity: 20,
        bookedSlots: 0,
        availableSlots: 20,
        status: 'scheduled',
      };

      const dto = toScheduledDepartureDto(mockItem);
      expect(dto.priceOverride).toBeNull();
    });
  });

  describe('Effective price resolution rule', () => {
    it('uses tour base price when priceOverride is null, empty or 0', () => {
      const tourBasePrice = '150.00';
      const resolvePrice = (priceOverride: string | null | undefined, basePrice: string) => {
        return priceOverride && Number(priceOverride) > 0 ? Number(priceOverride) : Number(basePrice);
      };

      expect(resolvePrice(null, tourBasePrice)).toBe(150);
      expect(resolvePrice('0', tourBasePrice)).toBe(150);
      expect(resolvePrice('0.00', tourBasePrice)).toBe(150);
      expect(resolvePrice('', tourBasePrice)).toBe(150);
      expect(resolvePrice('120.00', tourBasePrice)).toBe(120);
      expect(resolvePrice('200.00', tourBasePrice)).toBe(200);
    });
  });
});
