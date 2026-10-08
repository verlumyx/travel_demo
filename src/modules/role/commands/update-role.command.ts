export class UpdateRoleCommand {
  public readonly name: string;
  public readonly description?: string | null;
  public readonly permissionType: 'all' | 'custom';
  public readonly permissions: string[];
  public readonly status: 'active' | 'inactive';

  constructor(init: {
    readonly name: string;
  readonly description?: string | null;
  readonly permissionType: 'all' | 'custom';
  readonly permissions: string[];
  readonly status: 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): UpdateRoleCommand {
    return new UpdateRoleCommand(data);
  }
}
