import IDocItem, { IDocItemDetails, IDocItemOverview } from "./IDocItem";

export interface IDocTrackOverview extends IDocItemOverview {
  readonly line: [[number, number]];
}

// TODO: identify nullable fields
export interface IDocTrackDetails extends IDocItemDetails, IDocTrackOverview {
  readonly distance: string;
  readonly dogsAllowed: string;
  readonly kayakingDuration: string;
  readonly locationArray: string[];
  readonly mtbDuration: string;
  readonly mtbDurationCategory: string[];
  readonly mtbTrackCategory: string[];
  readonly permittedActivities: string[];
  readonly walkDuration: string;
  readonly walkDurationCategory: string[];
  readonly walkTrackCategory: string[];
  readonly wheelchairsAndBuggies: string;
}

export default interface IDocTrack extends IDocItem {
  readonly details: IDocTrackDetails;
  readonly overview: IDocTrackOverview;
}
