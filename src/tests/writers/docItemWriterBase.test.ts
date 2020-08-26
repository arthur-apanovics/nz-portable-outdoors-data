import { it } from "mocha";
import { assert } from "chai";
import { DocItemWriterBase } from "../../models/docItemWriterBase";
import IDocItem, {
  IDocItemAlerts,
  IDocItemDetails,
} from "../../interfaces/iDocItem";
import xmlParser from "fast-xml-parser";
import { promises as fs } from "fs";

describe("Generic DOC item writer", () => {
  const mockWriter = class MockDocItemWriter extends DocItemWriterBase<
    IDocItem
  > {
    protected async getDescriptionHtmlAsync(item: IDocItem): Promise<string> {
      return "<div>mock description</div>";
    }
  };
  const writer = new mockWriter();

  const mockDocItem = class MockDocItem implements IDocItem {
    readonly alerts: IDocItemAlerts;
    readonly assetId: number | string;
    readonly introduction: string;
    readonly introductionThumbnail: string | URL;
    readonly locationString: string;
    readonly name: string;
    readonly region: string | string[] | null;
    readonly staticLink: string | URL;
    readonly x: number;
    readonly y: number;

    constructor(details: IDocItemDetails) {
      Object.assign(this, details);
    }

    getDetailsHtmlAsync(): Promise<string> {
      return Promise.resolve("");
    }
  };

  const mockItems: IDocItem[] = [
    new mockDocItem({
      assetId: "1e72f18c-a04b-448b-95c5-2ce387948372",
      name: "Te Iringa Track",
      introduction:
        "On this challenging and remote adventure ride, pass through beech forest and enjoy the scenery, streams and wildlife of the Kaimanawa Forest Park. ",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/6ea48e9fe21449d08f7574b556d7f059.jpg",
      locationString: "Located in Kaimanawa Forest Park",
      region: ["Central North Island"],
      staticLink:
        "https://www.doc.govt.nz/link/1e72f18ca04b448b95c52ce387948372.aspx",
      x: 1878578.7107,
      y: 5678978.864,
    }),
    new mockDocItem({
      assetId: "b3e33c02-1732-4820-8715-4c7b9e337bd4",
      name: "Arrowtown Chinese Settlement",
      introduction:
        "One golden village, two tales. The picturesque preservation of two very different goldrush communities – Chinese and European – in a town that still thrives.",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/89e9e66a484143eabb60c5e402ce305d.aspx",
      locationString: "Located in Arrowtown area",
      region: ["Otago"],
      staticLink:
        "https://www.doc.govt.nz/link/b3e33c021732482087154c7b9e337bd4.aspx",
      x: 1270786.8283,
      y: 5015508.1128,
    }),
    new mockDocItem({
      assetId: "d3f5348a-5667-42d2-97dc-3c14e36d1a22",
      name: "Arthur’s Pass Walking Track ",
      introduction:
        "Experience the best of Arthur’s Pass's diverse alpine vegetation, waterfalls, wetlands, rich history and stunning mountain views on this walk.",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/173f5f06ff4641dea3be6b2857a77db4.aspx",
      locationString: "Located in Arthur's Pass National Park",
      region: ["Canterbury"],
      staticLink:
        "https://www.doc.govt.nz/link/d3f5348a566742d297dc3c14e36d1a22.aspx",
      x: 1482395.501,
      y: 5246902.4837,
    }),
    new mockDocItem({
      assetId: "84c9d244-0be1-4d91-b102-bf634e9009d8",
      name: "Asbestos Cottage tracks",
      introduction:
        "Walk to an historic cottage (built 1897) that was home to a reclusive couple for nearly 40 years.",
      introductionThumbnail:
        "https://www.doc.govt.nz/thumbs/large/link/45ea6bdca3f34fd7a7700225e0895491.jpg",
      locationString: "Located in Cobb Valley, Kahurangi National Park",
      region: ["Nelson/Tasman"],
      staticLink:
        "https://www.doc.govt.nz/link/84c9d2440be14d91b102bf634e9009d8.aspx",
      x: 1574229.2296,
      y: 5446837.2456,
    }),
  ];
  it("should generate KML document given a single object", async () => {
    const item = mockItems[0];
    const docName = "KML test - single";

    const kmlDocument = await writer.getKmlDocumentAsync(item, docName);
    assert.isTrue(xmlParser.validate(kmlDocument), "xml is valid");

    const parsed = xmlParser.getTraversalObj(kmlDocument);

    const kmlRoot = parsed.child["kml"][0];
    assert.isNotEmpty(kmlRoot);
    const documentRoot = kmlRoot.child["Document"][0];
    assert.isNotEmpty(documentRoot);
    const itemDocumentRoot = documentRoot.child["name"][0];
    assert.isNotEmpty(itemDocumentRoot);
    const itemKmlRoot = documentRoot.child["kml"][0];
    assert.isNotEmpty(itemKmlRoot);
    const itemFolderRoot = itemKmlRoot.child["Folder"][0];
    assert.isNotEmpty(itemFolderRoot);
    const itemFolderName = itemFolderRoot.child["name"][0];
    assert.isNotEmpty(itemFolderName);
    const placemarkRoot = itemFolderRoot.child["Placemark"][0];
    assert.isNotEmpty(placemarkRoot);
    const placemarkName = placemarkRoot.child["name"][0];
    assert.isNotEmpty(placemarkName);
    const placemarkDescription = placemarkRoot.child["description"][0];
    assert.isNotEmpty(placemarkDescription);

    assert.equal(itemFolderName.val, item.region[0]);
    assert.equal(placemarkName.val, item.name);
    assert.isNotEmpty(placemarkDescription.val);
  });

  it("should generate KML document given multiple objects", async () => {
    const docName = "KML test - many";
    const kmlDocument = await writer.getKmlDocumentAsync(mockItems, docName);
    assert.isTrue(xmlParser.validate(kmlDocument), "xml is valid");
  });

  it("should generate separate document for each region from given items", async () => {
    const regionDocuments = await writer.getKmlDocumentsForRegionsAsync(
      mockItems
    );
    const uniqueRegions = new Set(mockItems.map((i) => i.region)); // https://stackoverflow.com/a/44405494/13159550

    assert.equal(
      Object.keys(regionDocuments).length,
      uniqueRegions.size,
      "has a kml document for each region"
    );

    for (const regionName of Object.keys(regionDocuments)) {
      assert.isTrue(
        xmlParser.validate(regionDocuments[regionName]),
        `xml is valid for "${regionName}" region`
      );
    }
  });

  it("should convert string to valid filename", () => {
    const invalidFilename = " asd 123 #!@$ {}\"'></`";
    const validFilename = writer["toValidFilename"](invalidFilename);
    const rx = new RegExp(/^[^<>:;,?"*|/]+$/);
    assert.lengthOf(
      rx.exec(validFilename)[0],
      validFilename.length,
      "no invalid characters in filename"
    );
  });

  it("should write single document to file", async () => {
    const docName = "Single Item Test";
    const kmlDocument = await writer.getKmlDocumentAsync(mockItems[0], docName);

    await writer.writeKml(kmlDocument, docName);
    const filename = writer["toValidFilename"](docName);
    const path = `out/${filename}.kml`;
    const stats = await fs.stat(path); // will throw if not found

    assert.isTrue(stats.size > 0);
    assert.isTrue(stats.isFile());
    await fs.unlink(path);
  });

  it("should write document array to file", async () => {
    const kmlDocuments = await writer.getKmlDocumentsForRegionsAsync(mockItems);

    const paths = await writer.writeKml(kmlDocuments);
    for (const key in kmlDocuments) {
      const path = paths[key];
      const stats = await fs.stat(path); // will throw if not found

      assert.isTrue(stats.size > 0);
      assert.isTrue(stats.isFile());
      await fs.unlink(path);
    }
  });
});
