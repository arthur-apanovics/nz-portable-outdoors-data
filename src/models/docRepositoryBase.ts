import IDocApiEndpoint from "../interfaces/IDocEndpoint";
import got from "got";
import IDocItem, {
  IDocItemAlerts,
  IDocItemDetails,
  IDocAsset
} from "../interfaces/IDocItem";
import { promises as fs } from "fs";
import IRepository from "../interfaces/IRepository";

export abstract class DocApiEndpointBase<T extends IDocItem>
  implements IRepository<T> {
  protected abstract readonly apiKey: string;
  protected abstract readonly baseUrl: string;
  protected abstract readonly cacheFilename: string;
  protected abstract readonly urlSuffix: string;

  // getter fields
  private _allItems: Promise<T[]>;
  private _allAlerts: Promise<IDocItemAlerts[]>;

  public getAll(): Promise<T[]> {
    if (!this._allItems) {
      this._allItems = this.readObjectsFromCacheOrCreateAsync<T>(false);
    }
    return this._allItems;
  }

  public getAllAlerts(): Promise<IDocItemAlerts[]> {
    if (!this._allAlerts) {
      this._allAlerts = this.readObjectsFromCacheOrCreateAsync(true);
    }
    return this._allAlerts;
  }

  protected async getDetails(asset: IDocAsset): Promise<IDocItemDetails> {
    return this.sendDocHttpGetRequest(false);
  }

  protected async getAllObjectsAsync<T>(getAlerts: boolean): Promise<T[]> {
    return (await this.sendDocHttpGetRequest(getAlerts)) as T[];
  }

  protected async readObjectsFromCacheOrCreateAsync<T>(
    getAlerts: boolean
  ): Promise<T[]> {
    const path = getAlerts
      ? this.getCachePath()
      : `${this.getCachePath()}/alerts`;
    const expiryThreshold = 60 * 60 * 24 * 1000; // 24 hrs
    let objects: T[] | null;

    if (await this.isCacheExpiredOrMissing(path, expiryThreshold)) {
      // update|create cache
      objects = await this.getAllObjectsAsync(getAlerts);
      await this.cacheObjectsAsync(objects, path);
    } else {
      objects = JSON.parse(await fs.readFile(path, "utf8"));
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

  protected getCachePath(): string {
    return `cache/${this.cacheFilename}`;
  }

  protected async sendDocHttpGetRequest(getAlerts: boolean): Promise<any> {
    try {
      const base = `${this.baseUrl}/${this.urlSuffix}`;
      const url = getAlerts ? `${base}/alerts` : base;
      const response = await got(url, {
        method: "GET",
        responseType: "json",
        headers: { "x-api-key": this.apiKey },
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
          return await this.sendDocHttpGetRequest(getAlerts);
        default:
          throw error;
      }
    }
  }
}
