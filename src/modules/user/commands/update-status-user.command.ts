export class UpdateStatusUserCommand {
  public readonly status: 'active' | 'inactive';

  constructor(init: {
    readonly status: 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): UpdateStatusUserCommand {
    return new UpdateStatusUserCommand(data);
  }
}
