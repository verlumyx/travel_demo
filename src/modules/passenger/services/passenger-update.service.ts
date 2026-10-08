import { PassengerRepository } from '../repositories/passenger.repository';
import { UpdatePassengerCommand } from '../commands/update-passenger.command';

export class PassengerUpdateService {
  constructor(private readonly passengerRepository: PassengerRepository) {}

  async execute(command: UpdatePassengerCommand) {
    return this.passengerRepository.update(command.id, command);
  }
}
