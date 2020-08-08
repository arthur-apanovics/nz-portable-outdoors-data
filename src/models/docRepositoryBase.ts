import got from "got";
import IDocItem, {
  IDocItemAlerts,
  IDocItemDetails,
  IDocItemOverview
} from "../interfaces/iDocItem";
import { promises as fs } from "fs";
import IDocRepository from "../interfaces/iDocRepository";

export abstract class DocRepositoryBase<
  TItem extends IDocItem,
  TOverview extends IDocItemOverview,
  TDetails extends IDocItemDetails
> implements IDocRepository<TItem, TOverview, TDetails> {
  protected abstract readonly apiKey: string;
  // TODO: sendDocHttpGetRequest() does not timout if endpoint misconfigured...
  protected abstract readonly endpointUrl: string;

  // getter fields
  private _allItems: Promise<TOverview[]>;
  private _allAlerts: Promise<IDocItemAlerts[]>;

  // we cannot create new generic instances in TS without passing weird
  // constructor objects, just let the inheriting class implement this
  public abstract async getAsync(assetId: string | number): Promise<TItem>;

  public async getAllAsync(): Promise<TOverview[]> {
    if (!this._allItems) {
      this._allItems = this.readObjectsFromCacheOrCreateAsync<TOverview>(
        this.endpointUrl,
        "tracks"
      );
    }
    return this._allItems;
  }

  public async getAllAlertsAsync(): Promise<IDocItemAlerts[]> {
    if (!this._allAlerts) {
      this._allAlerts = this.readObjectsFromCacheOrCreateAsync<IDocItemAlerts>(
        `${this.endpointUrl}/alerts`,
        "tracks-alerts"
      );
    }
    return this._allAlerts;
  }

  public async getDetailsAsync(assetId: string | number): Promise<TDetails> {
    const endpoint = `${this.endpointUrl}/${assetId}/detail`;
    return (await this.sendDocHttpGetRequest(endpoint)) as TDetails;
  }

  public async getAlertsAsync(
    assetId: string | number
  ): Promise<IDocItemAlerts> {
    const endpoint = `${this.endpointUrl}/${assetId}/alerts`;
    return (await this.sendDocHttpGetRequest(endpoint)) as IDocItemAlerts;
  }

  protected async readObjectsFromCacheOrCreateAsync<T>(
    endpoint: string,
    cacheFilename: string
  ): Promise<T[]> {
    const expiryThreshold = 60 * 60 * 24 * 1000; // 24 hrs
    let objects: T[];

    if (await this.isCacheExpiredOrMissing(cacheFilename, expiryThreshold)) {
      // update|create cache
      objects = (await this.sendDocHttpGetRequest(endpoint)) as T[];
      await this.cacheObjectsAsync(objects, cacheFilename);
    } else {
      objects = JSON.parse(await fs.readFile(cacheFilename, "utf8"));
    }

    return objects;
  }

  protected async cacheObjectsAsync<T>(
    objects: T[],
    path: string
  ): Promise<void> {
    return await fs.writeFile(path, JSON.stringify(objects), {
      encoding: "utf8"
    });
  }

  protected async isCacheExpiredOrMissing(
    pathToFile: string,
    thresholdInMs: number
  ): Promise<boolean> {
    try {
      const fileAge = (await fs.stat(pathToFile)).birthtime.getMilliseconds(); // will throw if file does not exist
      const now = new Date().getTime();

      return now - fileAge >= thresholdInMs;
    } catch (ex) {
      switch (ex.errno) {
        case -4058:
          // file does not exist
          return true;
        default:
          throw ex;
      }
    }
  }

  protected async sendDocHttpGetRequest(endpoint: string): Promise<unknown> {
    try {
      const response = await got(endpoint, {
        method: "GET",
        responseType: "json",
        headers: { "x-api-key": this.apiKey },
        timeout: 1000,
        retry: {
          limit: 3,
          methods: ["GET"],
          statusCodes: [429],
          calculateDelay: retryObject => retryObject.attemptCount * 1000 // ms
        }
      });

      return response.body;
    } catch (error) {
      switch (error.response.statusCode) {
        case 429:
          // TODO: remove as this is now handled by library
          console.warn("Too many requests, will try again later");
          await new Promise(resolve => setTimeout(resolve, 2000)); // sleep
          return await this.sendDocHttpGetRequest(endpoint);
        default:
          throw error;
      }
    }
  }
}
