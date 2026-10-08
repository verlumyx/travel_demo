import type { UpdateDestinationInput } from '../validation/update-destination.schema';

export class UpdateDestinationCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly categoryId?: string | null,
    public readonly description?: string | null,
    public readonly imageUrl?: string | null,
    public readonly state?: string | null,
    public readonly city?: string | null,
    public readonly country: string = 'Venezuela',
  ) {}

  static fromInput(input: UpdateDestinationInput): UpdateDestinationCommand {
    return new UpdateDestinationCommand(
      input.name,
      input.slug,
      input.categoryId || null,
      input.description || null,
      input.imageUrl || null,
      input.state || null,
      input.city || null,
      input.country || 'Venezuela',
    );
  }
}
