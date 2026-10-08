import { BookingRepository } from '../repositories/booking.repository';
import { SearchBookingCommand } from '../commands/search-booking.command';

export class BookingSearchService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: SearchBookingCommand) {
    return this.bookingRepository.search(command);
  }
}
