import IDocItem from "../interfaces/iDocItem";
import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";

type IndexedDocumentObject = { [region: string]: xmlbuilder.XMLElement[] };
type IndexedStringObject = { [region: string]: string };

/**
 * Writes items to various file formats, e.g. XML, GPX, etc.
 */
export abstract class DocItemWriterBase<TItem extends IDocItem> {
  protected headers: { [index: string]: {} } = {
    kml: {
      xmlns: "http://www.opengis.net/kml/2.2",
      "xmlns:gx": "http://www.google.com/kml/ext/2.2",
      "xmlns:atom": "http://www.w3.org/2005/Atom",
    },
  };

  protected async getKmlPlacemarkElementAsync(
    item: TItem
  ): Promise<xmlbuilder.XMLElement> {
    return xmlbuilder
      .create("Placemark")
      .element("name", null, item.name)
      .up()
      .element("description")
      .cdata(await item.getDetailsHtmlAsync());
  }

  protected async getKmlRegionElementAsync(
    regionName: string,
    placemarks: xmlbuilder.XMLElement[],
    elementType: "Document" | "Folder"
  ): Promise<xmlbuilder.XMLElement> {
    const regionDoc = xmlbuilder
      .create("kml", this.headers["kml"])
      .element(elementType)
      .element("name", null, regionName)
      .up();

    for (const placemarkElement of placemarks) {
      regionDoc.importDocument(placemarkElement);
    }

    return regionDoc;
  }

  protected async getKmlPlacemarkElementsIndexedByRegionAsync(
    items: TItem[]
  ): Promise<IndexedDocumentObject> {
    // break down into individual regions indexed by region name
    const placemarkElementsByRegion = {};
    for (const item of items) {
      for (const region of item.region) {
        if (!placemarkElementsByRegion[region]) {
          placemarkElementsByRegion[region] = [];
        }

        const placemark = await this.getKmlPlacemarkElementAsync(item);
        placemarkElementsByRegion[region].push(placemark);
      }
    }

    return placemarkElementsByRegion;
  }

  public async getKmlDocumentsForRegionsAsync(
    items: TItem[]
  ): Promise<IndexedStringObject> {
    const regionDocuments: {
      [region: string]: any; // so that we can map without creating new object
    } = await this.getKmlPlacemarkElementsIndexedByRegionAsync(items);

    for (const regionName in regionDocuments) {
      const xmlElement = await this.getKmlRegionElementAsync(
        regionName,
        regionDocuments[regionName],
        "Document"
      );
      regionDocuments[regionName] = xmlElement.end();
    }

    return regionDocuments;
  }

  public async getKmlDocumentAsync(
    items: TItem | TItem[],
    documentName: string
  ): Promise<string> {
    if (!(items instanceof Array)) {
      items = [items];
    }

    let masterDoc = xmlbuilder
      .create("kml", this.headers["kml"])
      .element("Document")
      .element("name", null, documentName)
      .up();

    const regionPlacemarks = await this.getKmlPlacemarkElementsIndexedByRegionAsync(
      items
    );
    for (const regionKey in regionPlacemarks) {
      const region = await this.getKmlRegionElementAsync(
        regionKey,
        regionPlacemarks[regionKey],
        "Folder"
      );

      masterDoc.importDocument(region);
    }

    return masterDoc.end();
  }

  protected toValidFilename = (input: string): string =>
    input.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  private createOrOverwriteFile = async (fullPath: string, data: string) =>
    await fs.writeFile(fullPath, data, { encoding: "utf8" });

  /**
   * Writes input to KML file and returns path(s) of written file(s)
   */
  public async writeKml(input: string, filename: string): Promise<string>;
  public async writeKml(
    input: IndexedStringObject
  ): Promise<IndexedStringObject>;
  public async writeKml(
    input: string | IndexedStringObject,
    filename?: string
  ): Promise<string | IndexedStringObject> {
    if (typeof input === "string" && typeof filename === "string") {
      filename = this.toValidFilename(filename);
      const path = `out/${filename}.kml`;
      await this.createOrOverwriteFile(path, input);

      return path;
    } else if (typeof input === "object") {
      const paths = {};
      for (const key in input) {
        const filename = this.toValidFilename(key);
        const path = `out/${filename}.kml`;
        await this.createOrOverwriteFile(path, input[key]);
        paths[key] = path;
      }

      return paths;
    } else {
      throw new Error("Invalid arguments");
    }
  }
}
