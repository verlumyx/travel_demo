export class CreateDepartureCommand {
  private constructor(
    public readonly id: string,
    public readonly tourId: string,
    public readonly departureDate: Date,
    public readonly returnDate: Date | null,
    public readonly meetingPoint: string | null,
    public readonly meetingTime: string | null,
    public readonly priceOverride: string | null,
    public readonly totalCapacity: number,
    public readonly notes: string | null,
  ) {}

  static fromInput(input: any): CreateDepartureCommand {
    return new CreateDepartureCommand(
      input.id,
      input.tourId,
      new Date(input.departureDate),
      input.returnDate ? new Date(input.returnDate) : null,
      input.meetingPoint || null,
      input.meetingTime || null,
      input.priceOverride || null,
      Number(input.totalCapacity ?? 0),
      input.notes || null,
    );
  }
}
