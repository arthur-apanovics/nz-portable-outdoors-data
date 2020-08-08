import { IDocItemDetails, IDocItemOverview } from "./IDocItem";

export interface IDocHutOverview extends IDocItemOverview {
  readonly status: string;
}

export interface IDocHutDetails extends IDocItemDetails, IDocHutOverview {
  readonly bookable: boolean;
  readonly facilities: string[];
  readonly hutCategory: string;
  readonly numberOfBunks: number;
  readonly place: string;
  readonly proximityToRoadEnd: number | null;
}
