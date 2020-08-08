export interface IDocAsset {
  readonly assetId: number | string;
  readonly name: string;
}
export interface IDocItemOverview extends IDocAsset {
  readonly region: string | string[] | null;
  readonly y: number;
  readonly x: number;
}

export interface IDocItemDetails extends IDocItemOverview {
  readonly staticLink: string | URL;
  readonly locationString: string;
  readonly introduction: string;
  readonly introductionThumbnail: string | URL;
}

export interface IDocItemAlerts extends IDocAsset {
  readonly alerts: [
    {
      displayDate: string;
      heading: string; // title of alert
      detail: string; // html
    }
  ];
}

export default interface IDocItem extends IDocItemDetails {
  readonly alerts: IDocItemAlerts;
}
