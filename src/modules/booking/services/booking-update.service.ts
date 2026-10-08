import { BookingRepository } from '../repositories/booking.repository';
import { UpdateBookingCommand } from '../commands/update-booking.command';

export class BookingUpdateService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: UpdateBookingCommand) {
    return this.bookingRepository.update(command.id, command);
  }
}
