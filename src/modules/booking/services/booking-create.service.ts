import { BookingRepository } from '../repositories/booking.repository';
import { CreateBookingCommand } from '../commands/create-booking.command';

export class BookingCreateService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: CreateBookingCommand) {
    return this.bookingRepository.create(command);
  }
}
