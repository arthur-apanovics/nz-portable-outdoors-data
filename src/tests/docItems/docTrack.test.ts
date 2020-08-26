import { it } from "mocha";
import { assert } from "chai";
import { IDocTrackItemDetails } from "../../interfaces/iDocTrackItem";
import { DocTrack } from "../../models/docTrack";
import htmlParser from "node-html-parser";

describe("DOC Track", () => {
  const trackDetails: IDocTrackItemDetails = {
    assetId: "00000000-0000-0000-0000-000000000000",
    name: "Fake track",
    introduction: "Fake track description",
    introductionThumbnail: "https://via.placeholder.com/300/09f/fff.png",
    permittedActivities: ["Flying, Mining, Submarining"],
    distance: "666 km one way",
    walkDuration: "256 hr | 128 hr one way",
    walkDurationCategory: ["Over 9000 hours", "Under 10000 hours"],
    walkTrackCategory: ["Advanced", "Mega", "Ultra"],
    wheelchairsAndBuggies: null,
    mtbDuration: null,
    mtbDurationCategory: [],
    mtbTrackCategory: [],
    kayakingDuration: null,
    dogsAllowed: "Absolutely, most definitely, all dogs dogs welcome",
    locationString: "Located in Rapture, Pacific Ocean",
    locationArray: ["Rapture", "Pacific Ocean"],
    region: ["Northern Hemisphere", "Earth"],
    staticLink: "https://www.doc.govt.nz",
    x: 1574229.2296,
    y: 5446837.2456,
    line: [
      [
        [1570650.8507, 5446794.6762],
        [1570681.5853, 5446710.4702],
        [1570785.3334, 5446526.6408],
        // ...
      ],
    ],
  };
  const track = new DocTrack(trackDetails);

  it("should instantiate new DOC track", () => {
    assert.equal(track.alerts, null, "alerts are null as none were passed");
    assert.containsAllKeys(
      track,
      trackDetails,
      "track details are equal to passed details during instantiation"
    );
  });

  it("should convert NZGD coordinates to WSG", () => {
    const converted = track.getLineAsWsg86();
    const expected = [
      [
        [172.65034155794453, -41.12962129641851],
        [172.6507036929325, -41.13038092366679],
        [172.65193096259478, -41.13204057540484],
      ],
    ];

    assert.deepEqual(converted, expected);
  });

  it("should generate description HTML", async () => {
    const html = await track.getDetailsHtmlAsync();
    const parsed = htmlParser(html);

    const table = parsed.querySelector("table");
    assert.isNotEmpty(table);

    const rows = table.querySelectorAll("td");
    assert.isAbove(rows.length, 8, "contains all non-nullable fields");
  });
});
