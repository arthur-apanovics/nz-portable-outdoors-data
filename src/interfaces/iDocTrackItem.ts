import IDocItem, { IDocItemDetails, IDocItemOverview } from "./iDocItem";

export interface IDocTrackItemOverview extends IDocItemOverview {
  /** Coordinate array in NZGD2000 format */
  readonly line: Array<[number, number][]>;
}

export interface IDocTrackItemDetails
  extends IDocItemDetails,
    IDocTrackItemOverview {
  readonly distance: string | null;
  readonly dogsAllowed: string | null;
  readonly kayakingDuration: null | unknown; // checked all values manually and all were "null"
  readonly locationArray: string[];
  readonly mtbDuration: string | null;
  readonly mtbDurationCategory: string[];
  readonly mtbTrackCategory: string[];
  readonly permittedActivities: string[];
  readonly walkDuration: string | null;
  readonly walkDurationCategory: string[];
  readonly walkTrackCategory: string[];
  readonly wheelchairsAndBuggies: true | null;
}

export default interface IDocTrackItem extends IDocItem, IDocTrackItemDetails {
  getLineAsWsg86(): Array<[number, number][]>;
}
