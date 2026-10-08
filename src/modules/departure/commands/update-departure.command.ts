export class UpdateDepartureCommand {
  private constructor(
    public readonly tourId: string,
    public readonly departureDate: Date,
    public readonly returnDate: Date | null,
    public readonly meetingPoint: string | null,
    public readonly meetingTime: string | null,
    public readonly priceOverride: string | null,
    public readonly notes: string | null,
  ) {}

  static fromInput(input: any): UpdateDepartureCommand {
    return new UpdateDepartureCommand(
      input.tourId,
      new Date(input.departureDate),
      input.returnDate ? new Date(input.returnDate) : null,
      input.meetingPoint || null,
      input.meetingTime || null,
      input.priceOverride || null,
      input.notes || null,
    );
  }
}
