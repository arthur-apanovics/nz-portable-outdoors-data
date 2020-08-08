import IDocTrackItem, {
  IDocTrackItemDetails,
  IDocTrackItemOverview
} from "../interfaces/iDocTrackItem";
import { IDocItemAlerts } from "../interfaces/iDocItem";
import { DocRepositoryBase } from "./docRepositoryBase";
import { nzgdToWsg86 } from "../coordinateConverter";

export class DocTrack implements IDocTrackItem {
  readonly assetId: number | string;
  readonly distance: string;
  readonly dogsAllowed: string;
  readonly introduction: string;
  readonly introductionThumbnail: string | URL;
  readonly kayakingDuration: string | null;
  readonly line: Array<[number, number][]>;
  readonly locationArray: string[];
  readonly locationString: string;
  readonly mtbDuration: string | null;
  readonly mtbDurationCategory: string[];
  readonly mtbTrackCategory: string[];
  readonly name: string;
  readonly permittedActivities: string[];
  readonly region: string | string[] | null;
  readonly staticLink: string | URL;
  readonly walkDuration: string;
  readonly walkDurationCategory: string[];
  readonly walkTrackCategory: string[];
  readonly wheelchairsAndBuggies: string | null;
  readonly x: number;
  readonly y: number;

  readonly alerts: IDocItemAlerts;

  constructor(details: IDocTrackItemDetails, alerts?: IDocItemAlerts) {
    Object.assign(this, details);
    this.alerts = alerts || null;
  }

  lineToWsg86(): Array<[number, number][]> {
    return this.line.map(segment => segment.map(nzgdToWsg86));
  }
}

export class DocTracksRepository extends DocRepositoryBase<
  DocTrack,
  IDocTrackItemOverview,
  IDocTrackItemDetails
> {
  protected readonly apiKey = process.env.DOC_API_KEY_TRACKS;
  protected readonly endpointUrl = "https://api.doc.govt.nz/v1/tracks";

  public async getAsync(assetId: string | number): Promise<DocTrack> {
    const details = await this.getDetailsAsync(assetId);
    return new DocTrack(details);
  }
}
