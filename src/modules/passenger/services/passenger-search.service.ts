import { PassengerRepository } from '../repositories/passenger.repository';
import { SearchPassengerCommand } from '../commands/search-passenger.command';

export class PassengerSearchService {
  constructor(private readonly passengerRepository: PassengerRepository) {}

  async execute(command: SearchPassengerCommand) {
    return this.passengerRepository.search(command);
  }
}
