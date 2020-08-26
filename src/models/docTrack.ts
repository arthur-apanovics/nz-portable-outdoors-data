import IDocTrackItem, {
  IDocTrackItemDetails,
  IDocTrackItemOverview,
} from "../interfaces/iDocTrackItem";
import { IDocItemAlerts } from "../interfaces/iDocItem";
import { DocRepositoryBase } from "./docRepositoryBase";
import { nzgdToWsg86 } from "../coordinateConverter";
import trackDetails from "../components/docTrack/trackDetails";
import { display } from "../decorators/displayName";

export class DocTrack implements IDocTrackItem {
  // non-renderable properties
  readonly assetId: number | string;
  readonly line: Array<[number, number][]>;
  readonly x: number;
  readonly y: number;

  // renderable properties
  @display("Distance")
  readonly distance: string;
  @display("Dogs Allowed")
  readonly dogsAllowed: string;
  @display("Introduction")
  readonly introduction: string;
  @display("Introduction Thumbnail")
  readonly introductionThumbnail: string | URL;
  @display("Kayaking Duration")
  readonly kayakingDuration: string | null;
  @display("Location Array")
  readonly locationArray: string[];
  @display("Location String")
  readonly locationString: string;
  @display("MTB Duration")
  readonly mtbDuration: string | null;
  @display("MTB Duration Category")
  readonly mtbDurationCategory: string[];
  @display("MTB Track Category")
  readonly mtbTrackCategory: string[];
  @display("Name")
  readonly name: string;
  @display("Permitted Activities")
  readonly permittedActivities: string[];
  @display("Region")
  readonly region: string | string[] | null;
  @display("Static Link")
  readonly staticLink: string | URL;
  @display("Walk Duration")
  readonly walkDuration: string;
  @display("Walk Duration Category")
  readonly walkDurationCategory: string[];
  @display("Walk Track Category")
  readonly walkTrackCategory: string[];
  @display("Wheelchairs And Buggies")
  readonly wheelchairsAndBuggies: true | null;

  // todo: renderable
  readonly alerts: IDocItemAlerts;

  constructor(details: IDocTrackItemDetails, alerts?: IDocItemAlerts) {
    Object.assign(this, details);
    this.alerts = alerts || null;
  }

  getLineAsWsg86(): Array<[number, number][]> {
    return this.line.map((segment) => segment.map(nzgdToWsg86));
  }

  async getDetailsHtmlAsync(): Promise<string> {
    return trackDetails(this);
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

  public async getAllPopulatedAsync(): Promise<DocTrack[]> {
    return (await this.getDetailsAsync(await this.getAllAsync())).map(
      (d) => new DocTrack(d)
    );
  }
}
