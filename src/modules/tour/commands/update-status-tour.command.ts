export class UpdateStatusTourCommand {
  public readonly status: 'draft' | 'active' | 'inactive';

  constructor(init: {
    readonly status: 'draft' | 'active' | 'inactive';
  }) {
    Object.assign(this, init);
  }

  static fromInput(data: any): UpdateStatusTourCommand {
    return new UpdateStatusTourCommand(data);
  }
}
