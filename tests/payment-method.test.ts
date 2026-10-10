import { describe, it, expect } from 'vitest';
import {
  PAYMENT_METHOD_CODE_PREFIX,
  PAYMENT_METHOD_CODE_WIDTH,
  type PaymentMethodRow,
} from '@/modules/payment-method/models/payment-method.model';
import { createPaymentMethodSchema } from '@/modules/payment-method/validation/create-payment-method.schema';
import { updatePaymentMethodSchema } from '@/modules/payment-method/validation/update-payment-method.schema';
import { updateStatusPaymentMethodSchema } from '@/modules/payment-method/validation/update-status-payment-method.schema';
import { CreatePaymentMethodCommand } from '@/modules/payment-method/commands/create-payment-method.command';
import { toPaymentMethodDto } from '@/modules/payment-method/serializers/payment-method.serializer';
import { uuidv7 } from '@/modules/shared/uuid';

describe('Payment Method Module Unit Tests', () => {
  it('should use the PMT prefix and width 6', () => {
    expect(PAYMENT_METHOD_CODE_PREFIX).toBe('PMT');
    expect(PAYMENT_METHOD_CODE_WIDTH).toBe(6);
  });

  it('validates creation payload correctly with Zod', () => {
    const id = uuidv7();
    const validData = {
      id,
      name: 'Pago Móvil Banesco',
      currency: 'VES',
      instructions: 'Banco: Banesco (0134)\nTeléfono: 0414-1234567\nRIF: J-50000000-0',
    };

    const parsed = createPaymentMethodSchema.safeParse(validData);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const command = CreatePaymentMethodCommand.fromInput(parsed.data);
      expect(command.id).toBe(id);
      expect(command.name).toBe('Pago Móvil Banesco');
      expect(command.currency).toBe('VES');
      expect(command.instructions).toContain('0414-1234567');
    }
  });

  it('rejects creation if instructions are too short', () => {
    const invalidData = {
      id: uuidv7(),
      name: 'Zelle',
      currency: 'USD',
      instructions: '123', // less than 5 characters
    };

    const parsed = createPaymentMethodSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('validates status update only allows active or inactive', () => {
    expect(updateStatusPaymentMethodSchema.safeParse({ status: 'active' }).success).toBe(true);
    expect(updateStatusPaymentMethodSchema.safeParse({ status: 'inactive' }).success).toBe(true);
    expect(updateStatusPaymentMethodSchema.safeParse({ status: 'deleted' }).success).toBe(false);
  });

  it('serializes PaymentMethodRow to PaymentMethodDto correctly', () => {
    const now = new Date();
    const mockRow: PaymentMethodRow = {
      id: uuidv7(),
      code: 'PMT000001',
      name: 'Binance Pay',
      currency: 'USDT',
      instructions: 'ID: 84920194 (USDT)',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const dto = toPaymentMethodDto(mockRow);
    expect(dto.id).toBe(mockRow.id);
    expect(dto.code).toBe('PMT000001');
    expect(dto.instructions).toBe('ID: 84920194 (USDT)');
    expect(dto.createdAt).toBe(now.toISOString());
    expect(dto.updatedAt).toBe(now.toISOString());
  });
});
