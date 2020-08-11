import { it } from "mocha";
import { assert } from "chai";
import { DocRepositoryBase } from "../../models/docRepositoryBase";
import IDocItem, {
  IDocItemDetails,
  IDocItemOverview
} from "../../interfaces/IDocItem";
import { promises as fs } from "fs";

describe("Generic repository", () => {
  const mockRepo = class MockDocRepository extends DocRepositoryBase<
    IDocItem,
    IDocItemOverview,
    IDocItemDetails
  > {
    protected readonly apiKey = null;
    protected readonly endpointUrl = null;

    async getAsync(assetId: string | number): Promise<IDocItem> {
      return new Promise<IDocItem>(() => null);
    }
  };

  const repo = new mockRepo();

  it("should check if cache file exists", async () => {
    const shouldBeTrue = await repo["isCacheExpiredOrMissingAsync"](
      "not-a-real-path",
      0
    );
    assert.isTrue(shouldBeTrue, "Cached file does not exist");

    const tempFile = `${new Date().getTime()}.tmp`;
    await fs.writeFile(tempFile, "This should have been deleted");
    const shouldBeFalse = await repo["isCacheExpiredOrMissingAsync"](
      tempFile,
      0
    );
    await fs.unlink(tempFile);
    assert.isFalse(shouldBeFalse, "Cached file exists");
  });

  it("should send HTTP GET request", async () => {
    const response = await repo["sendHttpRequest"](
      "https://jsonplaceholder.typicode.com/users",
      {
        method: "GET",
        timeout: 2000
      }
    );

    assert.notEqual(response.statusCode, 404, "endpoint exists");
    assert.isNotEmpty(response.body, "received response from endpoint");
  });

  it("should timeout on invalid DOC url", async () => {
    const response = await repo["sendHttpRequest"](null, null);
    assert.isTrue(false, "todo: implement DOC timeout test");
  });

  it("should concurrently fetch data from API and retry no more than 3 times when 429 status code returned, all other should fail", async () => {
    assert.isTrue(false, "todo: implement test");
  });

  it("should implement getDetails overloading", async () => {
    let err = null;
    try {
      await repo.getDetailsAsync(NaN);
    } catch (e) {
      err = e;
    }

    // assert.throws does not play well with async functions
    assert.isTrue(err instanceof Error, "Throws on bad input");

    assert.isTrue(false, "todo: implement test fetching by id");
    assert.isTrue(false, "todo: implement test fetching by array");
  });
});
