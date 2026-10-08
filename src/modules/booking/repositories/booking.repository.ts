import type { CreateBookingCommand } from '../commands/create-booking.command';
import type { UpdateBookingCommand } from '../commands/update-booking.command';
import type { SearchBookingCommand } from '../commands/search-booking.command';
import type { BookingRow } from '../models/booking.model';
import type { CustomerRow } from '@/modules/customer/models/customer.model';
import type { DepartureRow } from '@/modules/departure/models/departure.model';
import type { TourRow } from '@/modules/tour/models/tour.model';
import type { PassengerRow } from '@/modules/passenger/models/passenger.model';
import type { PaymentRow } from '@/modules/payment/models/payment.model';

export type BookingWithDetailsRow = BookingRow & {
  customerName: string;
  customerCode: string;
  customerPhone: string | null;
  customerEmail: string | null;
  departureDate: Date;
  departureCode: string;
  tourName: string;
  tourCode: string;
};

export type BookingFullDetails = {
  booking: BookingRow;
  customer: CustomerRow;
  departure: DepartureRow;
  tour: TourRow;
  passengers: PassengerRow[];
  payments: PaymentRow[];
};

export interface BookingRepository {
  create(command: CreateBookingCommand): Promise<BookingRow>;
  findById(id: string): Promise<BookingRow | null>;
  findOrFail(id: string): Promise<BookingRow>;
  findWithDetails(id: string): Promise<BookingFullDetails | null>;
  findOrFailWithDetails(id: string): Promise<BookingFullDetails>;
  update(id: string, command: UpdateBookingCommand): Promise<BookingRow>;
  updateStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled',
  ): Promise<BookingRow>;
  cancel(id: string): Promise<BookingRow>;
  search(
    command: SearchBookingCommand,
  ): Promise<{ data: BookingWithDetailsRow[]; total: number }>;
}
