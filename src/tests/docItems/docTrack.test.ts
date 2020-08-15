import { it } from "mocha";
import { assert } from "chai";
import { IDocTrackItemDetails } from "../../interfaces/iDocTrackItem";
import { DocTrack } from "../../models/docTrack";

describe("DOC Track", () => {
  const trackDetails: IDocTrackItemDetails = {
    assetId: "84c9d244-0be1-4d91-b102-bf634e9009d8",
    name: "Asbestos Cottage tracks",
    introduction:
      "Walk to an historic cottage (built 1897) that was home to a reclusive couple for nearly 40 years.",
    introductionThumbnail:
      "https://www.doc.govt.nz/thumbs/large/link/45ea6bdca3f34fd7a7700225e0895491.jpg",
    permittedActivities: ["Walking and tramping"],
    distance: "6 km | 12.8 km one way",
    walkDuration: "2 hr | 4 - 5 hr one way",
    walkDurationCategory: ["Over 4 hours"],
    walkTrackCategory: ["Advanced"],
    wheelchairsAndBuggies: null,
    mtbDuration: null,
    mtbDurationCategory: [],
    mtbTrackCategory: [],
    kayakingDuration: null,
    dogsAllowed: "No dogs",
    locationString: "Located in Cobb Valley, Kahurangi National Park",
    locationArray: ["Cobb Valley", "Kahurangi National Park"],
    region: ["Nelson/Tasman"],
    staticLink:
      "https://www.doc.govt.nz/link/84c9d2440be14d91b102bf634e9009d8.aspx",
    x: 1574229.2296,
    y: 5446837.2456,
    line: [
      [
        [1570650.8507, 5446794.6762],
        [1570681.5853, 5446710.4702],
        [1570785.3334, 5446526.6408]
        // ...
      ]
    ]
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
        [172.65193096259478, -41.13204057540484]
      ]
    ];

    assert.deepEqual(converted, expected);
  });
});
