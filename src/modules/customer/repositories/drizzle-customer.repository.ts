import { and, count, desc, eq, like } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import type { CustomerRepository } from './customer.repository';
import type { CreateCustomerCommand } from '../commands/create-customer.command';
import type { UpdateCustomerCommand } from '../commands/update-customer.command';
import type { SearchCustomerCommand } from '../commands/search-customer.command';
import {
  customers,
  CUSTOMER_CODE_PREFIX,
  CUSTOMER_CODE_WIDTH,
  type CustomerRow,
} from '../models/customer.model';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { customerFilters } from './customer.filters';

export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreateCustomerCommand): Promise<CustomerRow> {
    const code = await this.generateNextCode();

    const [row] = await this.db
      .insert(customers)
      .values({
        id: command.id,
        code,
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
        phone: command.phone,
        documentType: command.documentType,
        documentNumber: command.documentNumber,
        birthDate: command.birthDate,
        emergencyContact: command.emergencyContact,
        emergencyPhone: command.emergencyPhone,
        notes: command.notes,
        source: command.source ?? 'admin',
        supabaseUserId: command.supabaseUserId,
        status: 'active',
      })
      .returning();

    return row;
  }

  async findById(id: string): Promise<CustomerRow | null> {
    const [row] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    return row ?? null;
  }

  async findOrFail(id: string): Promise<CustomerRow> {
    const row = await this.findById(id);
    if (!row) throw new CustomerNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateCustomerCommand): Promise<CustomerRow> {
    const [row] = await this.db
      .update(customers)
      .set({
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
        phone: command.phone,
        documentType: command.documentType,
        documentNumber: command.documentNumber,
        birthDate: command.birthDate,
        emergencyContact: command.emergencyContact,
        emergencyPhone: command.emergencyPhone,
        notes: command.notes,
        source: command.source,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();

    if (!row) throw new CustomerNotFoundException(id);
    return row;
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<CustomerRow> {
    const [row] = await this.db
      .update(customers)
      .set({ status, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();

    if (!row) throw new CustomerNotFoundException(id);
    return row;
  }

  async search(
    command: SearchCustomerCommand,
  ): Promise<{ data: CustomerRow[]; total: number }> {
    const conditions = applyFilters(customerFilters, command.filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(customers)
      .where(where);

    const data = await this.db
      .select()
      .from(customers)
      .where(where)
      .orderBy(desc(customers.createdAt))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total: Number(total) };
  }

  async getActive(): Promise<CustomerRow[]> {
    return this.db
      .select()
      .from(customers)
      .where(eq(customers.status, 'active'))
      .orderBy(customers.firstName, customers.lastName);
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(customers.code, `${CUSTOMER_CODE_PREFIX}%`);

    // Lock the highest row for update in the transaction
    await this.db
      .select({ id: customers.id })
      .from(customers)
      .where(scope)
      .orderBy(desc(customers.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: customers.code })
      .from(customers)
      .where(scope)
      .orderBy(desc(customers.code))
      .limit(1);

    const next = last
      ? Number(last.code.slice(CUSTOMER_CODE_PREFIX.length)) + 1
      : 1;

    return `${CUSTOMER_CODE_PREFIX}${String(next).padStart(
      CUSTOMER_CODE_WIDTH,
      '0',
    )}`;
  }
}
