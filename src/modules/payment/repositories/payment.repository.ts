import type { CreatePaymentCommand } from '../commands/create-payment.command';
import type { UpdatePaymentCommand } from '../commands/update-payment.command';
import type { SearchPaymentCommand } from '../commands/search-payment.command';
import type { PaymentRow } from '../models/payment.model';

export interface PaymentWithDetailsRow extends PaymentRow {
  bookingCode: string;
  bookingTotalAmount: string;
  bookingPaidAmount: string;
  bookingStatus: string;
  customerName: string;
  customerCode: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  tourName: string;
  tourCode: string;
  departureDate: Date;
  departureCode: string;
  verifiedByName?: string | null;
}

export interface PaymentFullDetails {
  payment: PaymentRow;
  booking: {
    id: string;
    code: string;
    totalAmount: string;
    paidAmount: string;
    status: string;
    slotsReserved: number;
  };
  customer: {
    id: string;
    code: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    documentType: string | null;
    documentNumber: string | null;
  };
  departure: {
    id: string;
    code: string;
    departureDate: Date;
  };
  tour: {
    id: string;
    name: string;
    code: string;
  };
  verifiedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PaymentMetrics {
  totalVerifiedAmount: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
}

export interface PaymentRepository {
  create(command: CreatePaymentCommand): Promise<PaymentRow>;
  findById(id: string): Promise<PaymentRow | null>;
  findOrFail(id: string): Promise<PaymentRow>;
  findWithDetails(id: string): Promise<PaymentFullDetails | null>;
  findOrFailWithDetails(id: string): Promise<PaymentFullDetails>;
  verify(id: string, verifiedById: string): Promise<PaymentRow>;
  reject(id: string, verifiedById: string): Promise<PaymentRow>;
  update(id: string, command: UpdatePaymentCommand): Promise<PaymentRow>;
  updateStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<PaymentRow>;
  search(command: SearchPaymentCommand): Promise<{ data: PaymentWithDetailsRow[]; total: number }>;
  getMetrics(): Promise<PaymentMetrics>;
}

