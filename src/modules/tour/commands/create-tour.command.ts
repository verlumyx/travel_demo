export class CreateTourCommand {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly description?: string | null;
  public readonly shortDescription?: string | null;
  public readonly imageUrl?: string | null;
  public readonly durationDays: number;
  public readonly basePrice: string;
  public readonly currency: string;
  public readonly includesFood: boolean;
  public readonly includesLodging: boolean;
  public readonly inclusions?: string | null;
  public readonly exclusions?: string | null;
  public readonly status: 'draft' | 'active' | 'inactive';

  constructor(init: {
    readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly shortDescription?: string | null;
  readonly imageUrl?: string | null;
  readonly durationDays: number;
  readonly basePrice: string;
  readonly currency: string;
  readonly includesFood: boolean;
  readonly includesLodging: boolean;
  readonly inclusions?: string | null;
  readonly exclusions?: string | null;
  readonly status: 'draft' | 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): CreateTourCommand {
    return new CreateTourCommand(data);
  }
}
