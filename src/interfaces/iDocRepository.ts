import IDocItem, {
  IDocItemAlerts,
  IDocItemDetails,
  IDocItemOverview
} from "./iDocItem";

export default interface IDocRepository<
  TItem extends IDocItem,
  TOverview extends IDocItemOverview,
  TDetails
> {
  getAsync(assetId: string | number): Promise<TItem>;
  getAllAsync(): Promise<TOverview[]>;
  getAllAlertsAsync(): Promise<IDocItemAlerts[]>;
  getDetailsAsync(assetId: string | number): Promise<TDetails>;
  getAlertsAsync(assetId: string | number): Promise<IDocItemAlerts>;
}
