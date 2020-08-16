import { it } from "mocha";
import { assert } from "chai";
import { DocTrack, DocTrackWriter } from "../../models/docTrack";
import IDocTrackItem, {
  IDocTrackItemDetails
} from "../../interfaces/iDocTrackItem";

describe("DOC Track item writer", () => {
  const mockTrackDetails: IDocTrackItemDetails[] = [
    {
      assetId: "1e72f18c-a04b-448b-95c5-2ce387948372",
      name: "Te Iringa Track",
      introduction:
        "On this challenging and remote adventure ride, pass through beech forest and enjoy the scenery, streams and wildlife of the Kaimanawa Forest Park. ",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/6ea48e9fe21449d08f7574b556d7f059.jpg",
      permittedActivities: ["Mountain biking"],
      distance: "19 km",
      walkDuration: null,
      walkDurationCategory: [],
      walkTrackCategory: [],
      wheelchairsAndBuggies: null,
      mtbDuration: "4 - 6 hr one way",
      mtbDurationCategory: ["Over 4 hours", "Overnight/multi-night"],
      mtbTrackCategory: ["Expert"],
      kayakingDuration: null,
      dogsAllowed:
        "Dogs with a DOC permit only. Contact the relevant DOC office to obtain a permit.",
      locationString: "Located in Kaimanawa Forest Park",
      locationArray: ["Kaimanawa Forest Park"],
      region: ["Central North Island"],
      staticLink:
        "https://www.doc.govt.nz/link/1e72f18ca04b448b95c52ce387948372.aspx",
      x: 1878578.7107,
      y: 5678978.864,
      line: [
        [
          [1879546.0564, 5674912.7921],
          [1879489.5903, 5674940.2294],
          [1879501.5313, 5674971.6442],
          [1879491.0491, 5674989.5823]
          //...
        ]
      ]
    },
    {
      assetId: "b3e33c02-1732-4820-8715-4c7b9e337bd4",
      name: "Arrowtown Chinese Settlement",
      introduction:
        "One golden village, two tales. The picturesque preservation of two very different goldrush communities – Chinese and European – in a town that still thrives.",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/89e9e66a484143eabb60c5e402ce305d.aspx",
      permittedActivities: ["Walking and tramping"],
      distance: null,
      walkDuration: "At your leisure",
      walkDurationCategory: ["Under 1 hour"],
      walkTrackCategory: ["Easiest"],
      wheelchairsAndBuggies: true,
      mtbDuration: null,
      mtbDurationCategory: [],
      mtbTrackCategory: [],
      kayakingDuration: null,
      dogsAllowed: "Dogs on a leash only",
      locationString: "Located in Arrowtown area",
      locationArray: ["Arrowtown area"],
      region: ["Otago"],
      staticLink:
        "https://www.doc.govt.nz/link/b3e33c021732482087154c7b9e337bd4.aspx",
      x: 1270786.8283,
      y: 5015508.1128,
      line: [
        [
          [1270878.6041, 5015484.3549],
          [1270912.6121, 5015516.417],
          [1270801.5004, 5015512.3183],
          [1270668.3947, 5015474.1655]
        ]
      ]
    },
    {
      assetId: "d3f5348a-5667-42d2-97dc-3c14e36d1a22",
      name: "Arthur’s Pass Walking Track ",
      introduction:
        "Experience the best of Arthur’s Pass's diverse alpine vegetation, waterfalls, wetlands, rich history and stunning mountain views on this walk.",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/173f5f06ff4641dea3be6b2857a77db4.aspx",
      permittedActivities: ["Walking and tramping"],
      distance: "6.8 km",
      walkDuration: "2 h 40 min",
      walkDurationCategory: ["1-4 hours"],
      walkTrackCategory: ["Easy"],
      wheelchairsAndBuggies: null,
      mtbDuration: null,
      mtbDurationCategory: [],
      mtbTrackCategory: [],
      kayakingDuration: null,
      dogsAllowed: "No dogs",
      locationString: "Located in Arthur's Pass National Park",
      locationArray: ["Arthur's Pass National Park"],
      region: ["Canterbury"],
      staticLink:
        "https://www.doc.govt.nz/link/d3f5348a566742d297dc3c14e36d1a22.aspx",
      x: 1482395.501,
      y: 5246902.4837,
      line: [
        [
          [1482545.93, 5245366.17],
          [1482521.8445, 5245579.5907],
          [1482575.9942, 5245634.6137],
          [1482591.715, 5245784.8354]
          //...
        ],
        [
          [1482373.8063, 5248140.87],
          [1482341.4912, 5248168.8182],
          [1482332.7574, 5248224.7147]
          //...
        ]
      ]
    },
    {
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
          [1570785.3334, 5446526.6408],
          [1570870.6877, 5446313.5242]
          //...
        ]
      ]
    }
  ];
  const writer = new DocTrackWriter();

  it("should generate HTML description", function() {
    const docTrack = new DocTrack(mockTrackDetails[0]);
    const html = DocTrackWriter["getDescriptionHtmlAsync"](docTrack);
    assert.isTrue(false);
  });
});
