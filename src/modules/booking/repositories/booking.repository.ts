import { CreateBookingCommand } from '../commands/create-booking.command';
import { UpdateBookingCommand } from '../commands/update-booking.command';
import { SearchBookingCommand } from '../commands/search-booking.command';
import { BookingRow } from '../models/booking.model';

export interface BookingRepository {
  create(command: CreateBookingCommand): Promise<BookingRow>;
  findById(id: string): Promise<BookingRow | null>;
  findOrFail(id: string): Promise<BookingRow>;
  update(id: string, command: UpdateBookingCommand): Promise<BookingRow>;
  updateStatus(id: string, status: 'pending' | 'confirmed' | 'partial_payment' | 'paid' | 'cancelled'): Promise<BookingRow>;
  search(command: SearchBookingCommand): Promise<{ data: BookingRow[], total: number }>;
}
