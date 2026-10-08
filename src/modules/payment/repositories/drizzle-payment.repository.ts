import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentCommand } from '../commands/create-payment.command';
import { UpdatePaymentCommand } from '../commands/update-payment.command';
import { SearchPaymentCommand } from '../commands/search-payment.command';
import { PaymentRow, payments, PAYMENT_CODE_PREFIX, PAYMENT_CODE_WIDTH } from '../models/payment.model';
import { PaymentNotFoundException } from '../exceptions/payment-not-found.exception';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { paymentFilters } from './payment.filters';
import { eq, sql } from 'drizzle-orm';

export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(private readonly db: DbExecutor) {}

  private async generateNextCode(tx: any): Promise<string> {
    const result = await tx.execute(
      sql`SELECT code FROM app_payments WHERE code LIKE ${PAYMENT_CODE_PREFIX || '%'} ORDER BY id DESC LIMIT 1 FOR UPDATE`
    );
    const lastCode = result.rows[0]?.code as string | undefined;
    let nextNumber = 1;
    if (lastCode) {
      const match = lastCode.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }
    return `${PAYMENT_CODE_PREFIX}${String(nextNumber).padStart(PAYMENT_CODE_WIDTH, '0')}`;
  }

  async create(command: CreatePaymentCommand): Promise<PaymentRow> {
    return await this.db.transaction(async (tx) => {
      const code = await this.generateNextCode(tx);
      const [row] = await tx.insert(payments).values({
        id: command.id,
        code,
        bookingId: command.bookingId,
        method: command.method,
        amount: command.amount,
        currency: command.currency,
        reference: command.reference,
        proofImageUrl: command.proofImageUrl,
        paymentDate: command.paymentDate,
        receivedByName: command.receivedByName,
        verifiedById: command.verifiedById,
        verifiedAt: command.verifiedAt,
        notes: command.notes
      }).returning();
      return row;
    });
  }

  async findById(id: string): Promise<PaymentRow | null> {
    const rows = await this.db.select().from(payments).where(eq(payments.id, id));
    return rows[0] || null;
  }

  async findOrFail(id: string): Promise<PaymentRow> {
    const row = await this.findById(id);
    if (!row) throw new PaymentNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdatePaymentCommand): Promise<PaymentRow> {
    const [row] = await this.db.update(payments).set({
      bookingId: command.bookingId,
      method: command.method,
      amount: command.amount,
      currency: command.currency,
      reference: command.reference,
      proofImageUrl: command.proofImageUrl,
      paymentDate: command.paymentDate,
      receivedByName: command.receivedByName,
      verifiedById: command.verifiedById,
      verifiedAt: command.verifiedAt,
      notes: command.notes
    }).where(eq(payments.id, id)).returning();
    if (!row) throw new PaymentNotFoundException(id);
    return row;
  }

  async updateStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<PaymentRow> {
    const [row] = await this.db.update(payments).set({ status }).where(eq(payments.id, id)).returning();
    if (!row) throw new PaymentNotFoundException(id);
    return row;
  }

  async search(command: SearchPaymentCommand): Promise<{ data: PaymentRow[], total: number }> {
    const query = this.db.select().from(payments).$dynamic();
    applyFilters(query, command.filters, paymentFilters);
    const countQuery = this.db.select({ count: sql<number>`count(*)` }).from(payments).$dynamic();
    applyFilters(countQuery, command.filters, paymentFilters);
    
    const [data, [{ count }]] = await Promise.all([
      query.limit(command.limit).offset(command.offset),
      countQuery
    ]);
    
    return { data, total: Number(count) };
  }
}
