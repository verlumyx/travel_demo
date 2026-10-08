export class CreateItineraryStopCommand {
  private constructor(
    public readonly tourId: string,
    public readonly destinationId: string,
    public readonly dayNumber: number,
    public readonly sortOrder: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly overnightStay: boolean,
  ) {}

  static fromInput(input: any): CreateItineraryStopCommand {
    return new CreateItineraryStopCommand(
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
