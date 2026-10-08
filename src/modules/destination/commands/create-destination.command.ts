export class CreateDestinationCommand {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly description?: string | null;
  public readonly imageUrl?: string | null;
  public readonly state?: string | null;
  public readonly city?: string | null;
  public readonly country: string;
  public readonly status: 'active' | 'inactive';

  constructor(init: {
    readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly imageUrl?: string | null;
  readonly state?: string | null;
  readonly city?: string | null;
  readonly country: string;
  readonly status: 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): CreateDestinationCommand {
    return new CreateDestinationCommand(data);
  }
}
