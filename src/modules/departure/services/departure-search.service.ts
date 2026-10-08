import type { SearchDepartureCommand } from '../commands/search-departure.command';
import type {
  DepartureRepository,
  DepartureWithTourRow,
} from '../repositories/departure.repository';

export class DepartureSearchService {
  constructor(private readonly repository: DepartureRepository) {}

  async execute(
    command: SearchDepartureCommand,
  ): Promise<{ data: DepartureWithTourRow[]; total: number }> {
    return this.repository.search(command);
  }
}
