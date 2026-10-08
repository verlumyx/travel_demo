import { and, count, desc, eq, like } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import type {
  PaymentRepository,
  PaymentWithDetailsRow,
  PaymentFullDetails,
  PaymentMetrics,
} from './payment.repository';
import type { CreatePaymentCommand } from '../commands/create-payment.command';
import type { UpdatePaymentCommand } from '../commands/update-payment.command';
import type { SearchPaymentCommand } from '../commands/search-payment.command';
import {
  payments,
  PAYMENT_CODE_PREFIX,
  PAYMENT_CODE_WIDTH,
  type PaymentRow,
} from '../models/payment.model';
import { bookings } from '@/modules/booking/models/booking.model';
import { customers } from '@/modules/customer/models/customer.model';
import { departures } from '@/modules/departure/models/departure.model';
import { tours } from '@/modules/tour/models/tour.model';
import { users } from '@/modules/user/models/user.model';
import { PaymentNotFoundException } from '../exceptions/payment-not-found.exception';
import { DomainError } from '@/modules/shared/exceptions/domain-error';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { paymentFilters } from './payment.filters';

export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreatePaymentCommand): Promise<PaymentRow> {
    const [booking] = await this.db
      .select({ id: bookings.id, status: bookings.status })
      .from(bookings)
      .where(eq(bookings.id, command.bookingId));

    if (!booking) {
      throw new DomainError('La reserva asociada no existe.');
    }

    if (booking.status === 'cancelled') {
      throw new DomainError('No se pueden registrar pagos a una reserva cancelada.');
    }

    const code = await this.generateNextCode();
    const initialStatus = command.status ?? 'pending';

    const [row] = await this.db
      .insert(payments)
      .values({
        id: command.id,
        code,
        bookingId: command.bookingId,
        method: command.method,
        amount: command.amount,
        currency: command.currency || 'USD',
        reference: command.reference || null,
        proofImageUrl: command.proofImageUrl || null,
        paymentDate: command.paymentDate,
        receivedByName: command.receivedByName || null,
        verifiedById: command.verifiedById || null,
        verifiedAt: command.verifiedAt || (initialStatus === 'verified' ? new Date() : null),
        notes: command.notes || null,
        status: initialStatus,
      })
      .returning();

    if (initialStatus === 'verified') {
      await this.recalculateBookingPayments(command.bookingId);
    }

    return row;
  }

  async findById(id: string): Promise<PaymentRow | null> {
    const [row] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<PaymentRow> {
    const row = await this.findById(id);
    if (!row) throw new PaymentNotFoundException(id);
    return row;
  }

  async findWithDetails(id: string): Promise<PaymentFullDetails | null> {
    const [row] = await this.db
      .select({
        payment: payments,
        booking: bookings,
        customer: customers,
        departure: departures,
        tour: tours,
        verifierName: users.name,
        verifierEmail: users.email,
        verifierId: users.id,
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.id))
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .leftJoin(users, eq(payments.verifiedById, users.id))
      .where(eq(payments.id, id))
      .limit(1);

    if (!row) return null;

    return {
      payment: row.payment,
      booking: {
        id: row.booking.id,
        code: row.booking.code,
        totalAmount: String(row.booking.totalAmount),
        paidAmount: String(row.booking.paidAmount),
        status: row.booking.status,
        slotsReserved: row.booking.slotsReserved,
      },
      customer: {
        id: row.customer.id,
        code: row.customer.code,
        fullName: `${row.customer.firstName} ${row.customer.lastName}`.trim(),
        phone: row.customer.phone,
        email: row.customer.email,
        documentType: row.customer.documentType,
        documentNumber: row.customer.documentNumber,
      },
      departure: {
        id: row.departure.id,
        code: row.departure.code,
        departureDate: row.departure.departureDate,
      },
      tour: {
        id: row.tour.id,
        name: row.tour.name,
        code: row.tour.code,
      },
      verifiedBy: row.verifierId
        ? {
            id: row.verifierId,
            name: row.verifierName!,
            email: row.verifierEmail!,
          }
        : null,
    };
  }

  async findOrFailWithDetails(id: string): Promise<PaymentFullDetails> {
    const result = await this.findWithDetails(id);
    if (!result) throw new PaymentNotFoundException(id);
    return result;
  }

  async verify(id: string, verifiedById: string): Promise<PaymentRow> {
    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .for('update');

    if (!payment) throw new PaymentNotFoundException(id);

    const [row] = await this.db
      .update(payments)
      .set({
        status: 'verified',
        verifiedById,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    await this.recalculateBookingPayments(payment.bookingId);
    return row;
  }

  async reject(id: string, verifiedById: string): Promise<PaymentRow> {
    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .for('update');

    if (!payment) throw new PaymentNotFoundException(id);

    const wasVerified = payment.status === 'verified';

    const [row] = await this.db
      .update(payments)
      .set({
        status: 'rejected',
        verifiedById,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    if (wasVerified) {
      await this.recalculateBookingPayments(payment.bookingId);
    }

    return row;
  }

  async update(id: string, command: UpdatePaymentCommand): Promise<PaymentRow> {
    const [row] = await this.db
      .update(payments)
      .set({
        reference: command.reference,
        proofImageUrl: command.proofImageUrl,
        receivedByName: command.receivedByName,
        notes: command.notes,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    if (!row) throw new PaymentNotFoundException(id);
    return row;
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'verified' | 'rejected',
  ): Promise<PaymentRow> {
    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .for('update');

    if (!payment) throw new PaymentNotFoundException(id);

    const [row] = await this.db
      .update(payments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    await this.recalculateBookingPayments(payment.bookingId);
    return row;
  }

  async search(
    command: SearchPaymentCommand,
  ): Promise<{ data: PaymentWithDetailsRow[]; total: number }> {
    const conditions = applyFilters(paymentFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(payments)
      .where(where);

    const rows = await this.db
      .select({
        payment: payments,
        bookingCode: bookings.code,
        bookingTotalAmount: bookings.totalAmount,
        bookingPaidAmount: bookings.paidAmount,
        bookingStatus: bookings.status,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerCode: customers.code,
        customerPhone: customers.phone,
        customerEmail: customers.email,
        tourName: tours.name,
        tourCode: tours.code,
        departureDate: departures.departureDate,
        departureCode: departures.code,
        verifiedByName: users.name,
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.id))
      .innerJoin(customers, eq(bookings.customerId, customers.id))
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(tours, eq(departures.tourId, tours.id))
      .leftJoin(users, eq(payments.verifiedById, users.id))
      .where(where)
      .orderBy(desc(payments.paymentDate))
      .limit(command.limit)
      .offset(command.offset);

    const data: PaymentWithDetailsRow[] = rows.map((r) => ({
      ...r.payment,
      bookingCode: r.bookingCode,
      bookingTotalAmount: String(r.bookingTotalAmount),
      bookingPaidAmount: String(r.bookingPaidAmount),
      bookingStatus: r.bookingStatus,
      customerName: `${r.customerFirstName} ${r.customerLastName}`.trim(),
      customerCode: r.customerCode,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      tourName: r.tourName,
      tourCode: r.tourCode,
      departureDate: r.departureDate,
      departureCode: r.departureCode,
      verifiedByName: r.verifiedByName,
    }));

    return { data, total: Number(total) };
  }

  async getMetrics(): Promise<PaymentMetrics> {
    const all = await this.db
      .select({
        amount: payments.amount,
        status: payments.status,
      })
      .from(payments);

    let totalVerifiedAmount = 0;
    let pendingCount = 0;
    let verifiedCount = 0;
    let rejectedCount = 0;

    for (const p of all) {
      if (p.status === 'verified') {
        totalVerifiedAmount += Number(p.amount);
        verifiedCount++;
      } else if (p.status === 'pending') {
        pendingCount++;
      } else if (p.status === 'rejected') {
        rejectedCount++;
      }
    }

    return {
      totalVerifiedAmount,
      pendingCount,
      verifiedCount,
      rejectedCount,
    };
  }

  private async recalculateBookingPayments(bookingId: string): Promise<void> {
    const [booking] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .for('update');

    if (!booking) return;

    // Sum all verified payments
    const verifiedPayments = await this.db
      .select({ amount: payments.amount })
      .from(payments)
      .where(and(eq(payments.bookingId, bookingId), eq(payments.status, 'verified')));

    const totalPaid = verifiedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalRequired = Number(booking.totalAmount);

    let newStatus = booking.status;
    if (booking.status !== 'cancelled') {
      if (totalPaid >= totalRequired) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial_payment';
      } else {
        newStatus = 'pending';
      }
    }

    await this.db
      .update(bookings)
      .set({
        paidAmount: totalPaid.toFixed(2),
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(payments.code, `${PAYMENT_CODE_PREFIX}%`);

    await this.db
      .select({ id: payments.id })
      .from(payments)
      .where(scope)
      .orderBy(desc(payments.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: payments.code })
      .from(payments)
      .where(scope)
      .orderBy(desc(payments.code))
      .limit(1);

    const next = last
      ? Number(last.code.slice(PAYMENT_CODE_PREFIX.length)) + 1
      : 1;

    return `${PAYMENT_CODE_PREFIX}${String(next).padStart(
      PAYMENT_CODE_WIDTH,
      '0',
    )}`;
  }
}
