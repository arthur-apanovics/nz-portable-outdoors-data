import got from "got";
import IDocItem, {
  IDocItemAlerts,
  IDocItemDetails,
  IDocItemOverview,
} from "../interfaces/iDocItem";
import { promises as fs } from "fs";
import IDocRepository from "../interfaces/iDocRepository";
import { OptionsOfJSONResponseBody } from "got/dist/source/types";

export abstract class DocRepositoryBase<
  TItem extends IDocItem,
  TOverview extends IDocItemOverview,
  TDetails extends IDocItemDetails
> implements IDocRepository<TItem, TOverview, TDetails> {
  protected abstract readonly apiKey: string;
  protected abstract readonly endpointUrl: string;

  // we cannot create new generic instances in TS without passing weird
  // constructor objects, just let the inheriting class implement this
  public abstract async getAsync(assetId: string | number): Promise<TItem>;

  public async getAllAsync(): Promise<TOverview[]> {
    const callback = async (): Promise<TOverview[]> =>
      await this.getDocData<TOverview[]>(this.endpointUrl, 10 * 1000);

    return await this.readFromCacheOrCreateAsync("tracks-alerts", callback);
  }

  public async getAllAlertsAsync(): Promise<IDocItemAlerts[]> {
    const callback = async (): Promise<IDocItemAlerts[]> =>
      await this.getDocData<IDocItemAlerts[]>(`${this.endpointUrl}/alerts`);

    return await this.readFromCacheOrCreateAsync("tracks-alerts", callback);
  }

  async getDetailsAsync(assetId: string | number): Promise<TDetails>;
  async getDetailsAsync(queue: TOverview[]): Promise<TDetails[]>;
  async getDetailsAsync(
    assetIdOrQueue: string | number | TOverview[]
  ): Promise<TDetails | TDetails[]> {
    if (
      typeof assetIdOrQueue === "string" ||
      typeof assetIdOrQueue === "number"
    ) {
      const endpoint = `${this.endpointUrl}/${assetIdOrQueue}/detail`;
      const newVar = (await this.getDocData(endpoint)) as TDetails;
      console.log("done...", assetIdOrQueue);
      return newVar;
    } else if (assetIdOrQueue instanceof Array) {
      const callback = async (): Promise<TDetails[]> => {
        const result: TDetails[] = [];
        const concurrent = 20;

        // concurrently fetch data
        for (let i = 0; i <= assetIdOrQueue.length; i += concurrent) {
          const promiseQueue = assetIdOrQueue
            .slice(0, concurrent)
            .map((q) => this.getDetailsAsync(q.assetId));
          const resolved = await Promise.all(promiseQueue);
          result.push(...resolved);
        }

        return result;
      };

      return this.readFromCacheOrCreateAsync("tracks-w-details", callback);
    } else {
      throw new Error(`Unsupported type: ${typeof assetIdOrQueue}`);
    }
  }

  public async getAlertsAsync(
    assetId: string | number
  ): Promise<IDocItemAlerts> {
    const endpoint = `${this.endpointUrl}/${assetId}/alerts`;
    return (await this.getDocData(endpoint)) as IDocItemAlerts;
  }

  protected async readFromCacheOrCreateAsync<T>(
    cacheFilename: string,
    fetchCallback: () => Promise<T>,
    expiryThreshold = 60 * 60 * 24 * 1000 // 24 hrs
  ): Promise<T> {
    const fullPath = `cache/${cacheFilename}.json`;
    let objects: T;

    if (await this.isCacheExpiredOrMissingAsync(fullPath, expiryThreshold)) {
      objects = await fetchCallback();
      await this.createCacheAsync(objects, fullPath);
    } else {
      objects = JSON.parse(await fs.readFile(fullPath, "utf8"));
    }

    return objects;
  }

  protected async createCacheAsync<T>(
    objects: T | T[],
    fullPath: string
  ): Promise<void> {
    return await fs.writeFile(fullPath, JSON.stringify(objects), {
      encoding: "utf8",
    });
  }

  protected async isCacheExpiredOrMissingAsync(
    pathToFile: string,
    thresholdInMs: number
  ): Promise<boolean> {
    try {
      const fileAge = (await fs.stat(pathToFile)).birthtime.getMilliseconds(); // will throw if file does not exist
      const now = new Date().getTime();

      return now - fileAge <= thresholdInMs;
    } catch (ex) {
      switch (ex.errno) {
        case -4058:
        case -2:
          // file does not exist
          return true;
        default:
          throw ex;
      }
    }
  }

  protected async getDocData<T>(endpoint: string, timeout = 5000): Promise<T> {
    const options: OptionsOfJSONResponseBody = {
      method: "GET",
      responseType: "json",
      headers: { "x-api-key": this.apiKey },
      timeout: timeout,
      retry: {
        limit: 3,
        methods: ["GET"],
        statusCodes: [429],
        calculateDelay: (retryObject) => {
          const retryIn = retryObject.attemptCount * 1000; // ms
          console.warn(
            `"${retryObject.error.message}" ...retrying in ${retryIn}`
          );
          return retryIn;
        },
      },
    };
    const response = await this.sendHttpRequest(endpoint, options);

    return response.body as T;
  }

  private async sendHttpRequest(
    url: string,
    gotOptions: OptionsOfJSONResponseBody
  ): Promise<any> {
    return got(url, gotOptions);
  }
}
