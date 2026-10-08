export class UpdateStatusDestinationCommand {
  public readonly status: 'active' | 'inactive';

  constructor(init: {
    readonly status: 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): UpdateStatusDestinationCommand {
    return new UpdateStatusDestinationCommand(data);
  }
}
