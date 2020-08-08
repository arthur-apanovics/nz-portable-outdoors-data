import { IDocApiItemDetails, IDocApiItemOverview } from "./interfaces/DocApi";

export interface IDocCampsiteOverview extends IDocApiItemOverview {
  readonly status: string;
}

export interface IDocCampsiteDetails
  extends IDocApiItemDetails,
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
