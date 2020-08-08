export interface IDocAsset {
  readonly assetId: number | string;
  readonly name: string;
}
export interface IDocApiItemOverview extends IDocAsset {
  readonly region: string | string[] | null;
  readonly y: number;
  readonly x: number;
}

export interface IDocApiItemDetails extends IDocApiItemOverview {
  readonly staticLink: string | URL;
  readonly locationString: string;
  readonly introduction: string;
  readonly introductionThumbnail: string | URL;
}

export interface IDocApiItemAlerts extends IDocAsset {
  readonly alerts: [
    {
      displayDate: string;
      heading: string; // title of alert
      detail: string; // html
    }
  ];
}

export default interface IDocApiItem {
  readonly overview: IDocApiItemOverview;
  readonly details: IDocApiItemDetails;
  readonly alerts: IDocApiItemAlerts;
}
