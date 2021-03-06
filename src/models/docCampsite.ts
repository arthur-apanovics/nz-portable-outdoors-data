import { IDocItemDetails, IDocItemOverview } from "../interfaces/iDocItem";

export interface IDocCampsiteOverview extends IDocItemOverview {
  readonly status: string;
}

export interface IDocCampsiteDetails
  extends IDocItemDetails,
    IDocCampsiteOverview {
  readonly access: string[];
  readonly activities: string[];
  readonly bookable: boolean;
  readonly campsiteCategory: string;
  readonly dogsAllowed: string;
  readonly facilities: string[];
  readonly landscape: string[];
  readonly numberOfPoweredSites: number;
  readonly numberOfUnpoweredSites: number;
}
