export class CreateRoleCommand {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string | null;
  public readonly permissionType: 'all' | 'custom';
  public readonly permissions: string[];
  public readonly status: 'active' | 'inactive';

  constructor(init: {
    readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly permissionType: 'all' | 'custom';
  readonly permissions: string[];
  readonly status: 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): CreateRoleCommand {
    return new CreateRoleCommand(data);
  }
}
