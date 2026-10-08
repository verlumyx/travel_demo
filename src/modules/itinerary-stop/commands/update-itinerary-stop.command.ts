export class UpdateItineraryStopCommand {
  private constructor(
    public readonly id: string,
    public readonly tourId: string,
    public readonly destinationId: string,
    public readonly dayNumber: number,
    public readonly sortOrder: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly overnightStay: boolean,
  ) {}

  static fromInput(id: string, input: any): UpdateItineraryStopCommand {
    return new UpdateItineraryStopCommand(
      id,
      input.tourId,
      input.destinationId,
      input.dayNumber,
      input.sortOrder,
      input.title,
      input.description ?? null,
      input.overnightStay,
    );
  }
}
