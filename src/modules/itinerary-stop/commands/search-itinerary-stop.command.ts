export class SearchItineraryStopCommand {
  private constructor(
    public readonly filters: { tourId?: string; destinationId?: string },
    public readonly limit: number,
    public readonly offset: number,
  ) {}

  static fromInput(input: any): SearchItineraryStopCommand {
    return new SearchItineraryStopCommand(
      {
        tourId: input.tourId,
        destinationId: input.destinationId,
      },
      input.limit ?? 20,
      input.offset ?? 0,
    );
  }
}
