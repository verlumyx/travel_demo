import { BookingRepository } from '../repositories/booking.repository';

export class BookingFindService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async findById(id: string) {
    return this.bookingRepository.findById(id);
  }

  async findOrFail(id: string) {
    return this.bookingRepository.findOrFail(id);
  }
}
