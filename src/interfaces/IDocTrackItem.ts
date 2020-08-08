import IDocItem, { IDocItemDetails, IDocItemOverview } from "./IDocItem";

export interface IDocTrackItemOverview extends IDocItemOverview {
  /** Coordinate array in NZGD2000 format */
  readonly line: Array<[number, number][]>;
}

export interface IDocTrackItemDetails
  extends IDocItemDetails,
    IDocTrackItemOverview {
  readonly distance: string;
  readonly dogsAllowed: string;
  readonly kayakingDuration: string | null;
  readonly locationArray: string[];
  readonly mtbDuration: string | null;
  readonly mtbDurationCategory: string[];
  readonly mtbTrackCategory: string[];
  readonly permittedActivities: string[];
  readonly walkDuration: string;
  readonly walkDurationCategory: string[];
  readonly walkTrackCategory: string[];
  readonly wheelchairsAndBuggies: string | null;
}

export default interface IDocTrackItem extends IDocItem, IDocTrackItemDetails {
  lineToWsg86(): Array<[number, number][]>;
}
