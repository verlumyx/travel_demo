import { and, desc, eq, like, count } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  app_payment_methods,
  PAYMENT_METHOD_CODE_PREFIX,
  PAYMENT_METHOD_CODE_WIDTH,
  type PaymentMethodRow,
} from '../models/payment-method.model';
import type { PaymentMethodRepository } from './payment-method.repository';
import { paymentMethodFilters } from './payment-method.filters';
import type { CreatePaymentMethodCommand } from '../commands/create-payment-method.command';
import type { UpdatePaymentMethodCommand } from '../commands/update-payment-method.command';
import type { UpdateStatusPaymentMethodCommand } from '../commands/update-status-payment-method.command';
import type { SearchPaymentMethodCommand } from '../commands/search-payment-method.command';
import { PaymentMethodNotFoundException } from '../exceptions/payment-method-not-found.exception';

export class DrizzlePaymentMethodRepository implements PaymentMethodRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreatePaymentMethodCommand): Promise<PaymentMethodRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(app_payment_methods)
      .values({
        id: command.id,
        code,
        name: command.name,
        currency: command.currency,
        instructions: command.instructions,
        status: 'active',
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<PaymentMethodRow | null> {
    const [row] = await this.db
      .select()
      .from(app_payment_methods)
      .where(eq(app_payment_methods.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<PaymentMethodRow> {
    const row = await this.findById(id);
    if (!row) throw new PaymentMethodNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdatePaymentMethodCommand): Promise<PaymentMethodRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_payment_methods)
      .set({
        name: command.name,
        currency: command.currency,
        instructions: command.instructions,
      })
      .where(eq(app_payment_methods.id, id))
      .returning();

    return row;
  }

  async updateStatus(id: string, command: UpdateStatusPaymentMethodCommand): Promise<PaymentMethodRow> {
    await this.findOrFail(id);

    const [row] = await this.db
      .update(app_payment_methods)
      .set({ status: command.status })
      .where(eq(app_payment_methods.id, id))
      .returning();

    return row;
  }

  async search(command: SearchPaymentMethodCommand): Promise<{ data: PaymentMethodRow[]; total: number }> {
    const conditions = applyFilters(paymentMethodFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(app_payment_methods)
      .where(where);

    const data = await this.db
      .select()
      .from(app_payment_methods)
      .where(where)
      .orderBy(desc(app_payment_methods.createdAt))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total: Number(total) };
  }

  async getActive(): Promise<PaymentMethodRow[]> {
    return this.db
      .select()
      .from(app_payment_methods)
      .where(eq(app_payment_methods.status, 'active'))
      .orderBy(app_payment_methods.name);
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(app_payment_methods.code, `${PAYMENT_METHOD_CODE_PREFIX}%`);

    // Lock the highest row for update in the transaction
    await this.db
      .select({ id: app_payment_methods.id })
      .from(app_payment_methods)
      .where(scope)
      .orderBy(desc(app_payment_methods.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: app_payment_methods.code })
      .from(app_payment_methods)
      .where(scope)
      .orderBy(desc(app_payment_methods.code))
      .limit(1);

    const next = last ? Number(last.code.slice(PAYMENT_METHOD_CODE_PREFIX.length)) + 1 : 1;
    return `${PAYMENT_METHOD_CODE_PREFIX}${String(next).padStart(PAYMENT_METHOD_CODE_WIDTH, '0')}`;
  }
}
