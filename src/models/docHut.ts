import { IDocApiItemDetails, IDocApiItemOverview } from "./interfaces/DocApi";

export interface IDocHutOverview extends IDocApiItemOverview {
  readonly status: string;
}

export interface IDocHutDetails extends IDocApiItemDetails, IDocHutOverview {
  readonly bookable: boolean;
  readonly facilities: string[];
  readonly hutCategory: string;
  readonly numberOfBunks: number;
  readonly place: string;
  readonly proximityToRoadEnd: number | null;
}
