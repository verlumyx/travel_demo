import { BookingRepository } from '../repositories/booking.repository';
import { UpdateStatusBookingCommand } from '../commands/update-status-booking.command';

export class BookingUpdateStatusService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: UpdateStatusBookingCommand) {
    return this.bookingRepository.updateStatus(command.id, command.status);
  }
}
