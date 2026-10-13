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
    const rawPrice =
      input.priceOverride !== undefined && input.priceOverride !== null
        ? String(input.priceOverride).trim()
        : null;
    const priceNum = rawPrice ? Number(rawPrice) : NaN;
    const priceOverride =
      !isNaN(priceNum) && priceNum > 0 ? priceNum.toFixed(2) : null;

    return new CreateDepartureCommand(
      input.id,
      input.tourId,
      new Date(input.departureDate),
      input.returnDate ? new Date(input.returnDate) : null,
      input.meetingPoint || null,
      input.meetingTime || null,
      priceOverride,
      Number(input.totalCapacity ?? 0),
      input.notes || null,
    );
  }
}
