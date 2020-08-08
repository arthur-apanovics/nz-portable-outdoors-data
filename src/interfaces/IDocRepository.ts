import IDocItem, { IDocItemAlerts, IDocItemDetails } from "./IDocItem";

export default interface IRepository<T extends IDocItem> {
  getAll(): T[];
  getAllAlerts(): T[];
  get(assetId: string | number): T;
  getDetails(assetId: string | number): IDocItemDetails;
  getAlerts(assetId: string | number): IDocItemAlerts;
}
