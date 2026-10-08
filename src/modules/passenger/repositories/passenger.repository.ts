import { CreatePassengerCommand } from '../commands/create-passenger.command';
import { UpdatePassengerCommand } from '../commands/update-passenger.command';
import { SearchPassengerCommand } from '../commands/search-passenger.command';
import { PassengerRow } from '../models/passenger.model';

export interface PassengerRepository {
  create(command: CreatePassengerCommand): Promise<PassengerRow>;
  findById(id: string): Promise<PassengerRow | null>;
  findOrFail(id: string): Promise<PassengerRow>;
  update(id: string, command: UpdatePassengerCommand): Promise<PassengerRow>;
  search(command: SearchPassengerCommand): Promise<{ data: PassengerRow[], total: number }>;
}
