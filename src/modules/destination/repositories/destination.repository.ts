import type { DestinationRow, NewDestinationRow } from '../models/destination.model';
import type { CreateDestinationCommand } from '../commands/create-destination.command';
import type { UpdateDestinationCommand } from '../commands/update-destination.command';
import type { SearchDestinationCommand } from '../commands/search-destination.command';

export interface DestinationRepository {
  create(command: CreateDestinationCommand): Promise<DestinationRow>;
  findById(id: string): Promise<DestinationRow | null>;
  findOrFail(id: string): Promise<DestinationRow>;
  update(id: string, command: UpdateDestinationCommand): Promise<DestinationRow>;
  updateStatus(id: string, status: string): Promise<DestinationRow>;
  search(command: SearchDestinationCommand): Promise<{ data: DestinationRow[], total: number }>;
}
