export class UpdateUserCommand {
  public readonly name: string;
  public readonly email: string;
  public readonly roleId: string;
  public readonly phone?: string | null;
  public readonly avatarUrl?: string | null;
  public readonly status: 'active' | 'inactive';

  constructor(init: {
    readonly name: string;
    readonly email: string;
    readonly roleId: string;
    readonly phone?: string | null;
    readonly avatarUrl?: string | null;
    readonly status: 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): UpdateUserCommand {
    return new UpdateUserCommand(data);
  }
}
