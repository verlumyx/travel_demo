import { describe, it, expect, vi } from 'vitest';
import { logSystemError } from '@/modules/system-log/services/system-logger';
import { toSystemLogDto } from '@/modules/system-log/serializers/system-log.serializer';
import type { SystemLogRow } from '@/modules/system-log/models/system-log.model';

describe('System Logger Module', () => {
  it('toSystemLogDto converts date to ISO string correctly', () => {
    const row: SystemLogRow = {
      id: '01a12345-6789-7000-8000-000000000000',
      level: 'error',
      source: 'checkout',
      message: 'Fallo al procesar reserva de prueba',
      errorName: 'DepartureNotFoundException',
      stack: 'Error: not found\n  at test:1:1',
      path: '/reservar/test-id',
      action: 'clientCheckoutAction',
      context: { departureId: 'test-id', slotsCount: 2 },
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      status: 'unread',
      createdAt: new Date('2026-10-15T18:00:00Z'),
    };

    const dto = toSystemLogDto(row);
    expect(dto.id).toBe(row.id);
    expect(dto.level).toBe('error');
    expect(dto.source).toBe('checkout');
    expect(dto.message).toBe('Fallo al procesar reserva de prueba');
    expect(dto.createdAt).toBe('2026-10-15T18:00:00.000Z');
    expect(dto.context).toEqual({ departureId: 'test-id', slotsCount: 2 });
  });

  it('logSystemError is fail-safe and never throws even on invalid db connection', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      logSystemError({
        level: 'error',
        source: 'checkout',
        message: 'Prueba de logger fail-safe',
        error: new Error('Simulated failure'),
        context: { email: 'test@example.com' },
      }),
    ).resolves.not.toThrow();

    consoleErrorSpy.mockRestore();
  });
});
