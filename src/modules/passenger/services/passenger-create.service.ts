import { PassengerRepository } from '../repositories/passenger.repository';
import { CreatePassengerCommand } from '../commands/create-passenger.command';

export class PassengerCreateService {
  constructor(private readonly passengerRepository: PassengerRepository) {}

  async execute(command: CreatePassengerCommand) {
    return this.passengerRepository.create(command);
  }
}
