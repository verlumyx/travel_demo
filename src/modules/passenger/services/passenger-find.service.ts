import { PassengerRepository } from '../repositories/passenger.repository';

export class PassengerFindService {
  constructor(private readonly passengerRepository: PassengerRepository) {}

  async findById(id: string) {
    return this.passengerRepository.findById(id);
  }

  async findOrFail(id: string) {
    return this.passengerRepository.findOrFail(id);
  }
}
