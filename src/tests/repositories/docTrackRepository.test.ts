import { it } from "mocha";
import { assert } from "chai";
import { DocTracksRepository } from "../../models/docTrack";
import { IDocAsset } from "../../interfaces/iDocItem";

describe("DOC Track Repository", () => {
  require("dotenv").config();

  it("should have api key defined in ENV file", () => {
    assert.isNotEmpty(process.env.DOC_API_KEY_TRACKS, "api key set");
  });

  const repo = new DocTracksRepository();

  it("should be configured correctly", () => {
    const extracted = Object.entries(repo);

    const endpoint: string = extracted.find(
      (arr) => arr[0] == "endpointUrl"
    )[1];
    assert.isTrue(endpoint.startsWith("https://"), "endpoint is using https");
    assert.isFalse(endpoint.endsWith("/"), "endpoint has no trailing slash");
  });

  it("should fetch track by id from DOC API", async () => {
    const expected: IDocAsset = {
      assetId: "84c9d244-0be1-4d91-b102-bf634e9009d8",
      name: "Asbestos Cottage tracks",
    };
    const result = await repo.getAsync(expected.assetId);

    assert.equal(result.assetId, expected.assetId);
    assert.equal(result.name, expected.name);
  });

  it("should fetch all tracks from cache or API", async () => {
    const result = await repo.getAllAsync();
    assert.isAbove(result.length, 10, "fetched multiple tracks");
  });

  it("should fetch all track alerts from cache or API", async () => {
    const result = await repo.getAllAlertsAsync();
    assert.isAbove(result.length, 10, "fetched multiple alerts");
  });

  it("should fetch all tracks as instantiated class objects with populated data", async function () {
    const result = await repo.getAllPopulatedAsync();
    assert.isAbove(result.length, 10, "populated multiple tracks");
    assert.isNotEmpty(result[0], "track has values");
  });
});
