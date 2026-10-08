import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerCommand } from '../commands/create-customer.command';
import { UpdateCustomerCommand } from '../commands/update-customer.command';
import { SearchCustomerCommand } from '../commands/search-customer.command';
import { CustomerRow, customers, CUSTOMER_CODE_PREFIX, CUSTOMER_CODE_WIDTH } from '../models/customer.model';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { customerFilters } from './customer.filters';
import { eq, sql } from 'drizzle-orm';

export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DbExecutor) {}

  private async generateNextCode(tx: any): Promise<string> {
    const result = await tx.execute(
      sql`SELECT code FROM app_customers WHERE code LIKE ${CUSTOMER_CODE_PREFIX || '%'} ORDER BY id DESC LIMIT 1 FOR UPDATE`
    );
    const lastCode = result.rows[0]?.code as string | undefined;
    let nextNumber = 1;
    if (lastCode) {
      const match = lastCode.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }
    return `${CUSTOMER_CODE_PREFIX}${String(nextNumber).padStart(CUSTOMER_CODE_WIDTH, '0')}`;
  }

  async create(command: CreateCustomerCommand): Promise<CustomerRow> {
    return await this.db.transaction(async (tx) => {
      const code = await this.generateNextCode(tx);
      const [row] = await tx.insert(customers).values({
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
        source: command.source,
        supabaseUserId: command.supabaseUserId
      }).returning();
      return row;
    });
  }

  async findById(id: string): Promise<CustomerRow | null> {
    const rows = await this.db.select().from(customers).where(eq(customers.id, id));
    return rows[0] || null;
  }

  async findOrFail(id: string): Promise<CustomerRow> {
    const row = await this.findById(id);
    if (!row) throw new CustomerNotFoundException(id);
    return row;
  }

  async update(id: string, command: UpdateCustomerCommand): Promise<CustomerRow> {
    const [row] = await this.db.update(customers).set({
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
      source: command.source
    }).where(eq(customers.id, id)).returning();
    if (!row) throw new CustomerNotFoundException(id);
    return row;
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<CustomerRow> {
    const [row] = await this.db.update(customers).set({ status }).where(eq(customers.id, id)).returning();
    if (!row) throw new CustomerNotFoundException(id);
    return row;
  }

  async search(command: SearchCustomerCommand): Promise<{ data: CustomerRow[], total: number }> {
    const query = this.db.select().from(customers).$dynamic();
    applyFilters(query, command.filters, customerFilters);
    const countQuery = this.db.select({ count: sql<number>`count(*)` }).from(customers).$dynamic();
    applyFilters(countQuery, command.filters, customerFilters);
    
    const [data, [{ count }]] = await Promise.all([
      query.limit(command.limit).offset(command.offset),
      countQuery
    ]);
    
    return { data, total: Number(count) };
  }
}
