import IDocItem from "../interfaces/iDocItem";
import xmlbuilder from "xmlbuilder";
import { minify } from "html-minifier";
import { promises as fs } from "fs";

/**
 * Writes items to various file formats, e.g. XML, GPX, etc.
 */
export abstract class DocItemWriterBase<TItem extends IDocItem> {
  protected headers: { [index: string]: {} } = {
    kml: {
      xmlns: "http://www.opengis.net/kml/2.2",
      "xmlns:gx": "http://www.google.com/kml/ext/2.2",
      "xmlns:atom": "http://www.w3.org/2005/Atom"
    }
  };

  protected toValidFilename = (input: string): string =>
    input.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  protected abstract async getDescriptionHtmlAsync(
    item: TItem
  ): Promise<string>;

  protected async getKmlPlacemarkElementAsync(
    item: TItem
  ): Promise<xmlbuilder.XMLElement> {
    return xmlbuilder
      .create("Placemark")
      .element("name", null, item.name)
      .up()
      .element("description")
      .cdata(await this.getDescriptionHtmlAsync(item));
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
  ): Promise<{
    [index: string]: xmlbuilder.XMLElement[];
  }> {
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
  ): Promise<{ [region: string]: string }> {
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

  public async getKmlMasterDocumentAsync(
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

  protected writeToFile(input: string | string[]): void {
    throw new Error("not implemented");

    if (input instanceof Array) {
      // for (const region in regionPlacemarks) {
      //   const path = `out/${toFilename(region)}.kml`;
      //
      //   try {
      //     // delete existing file
      //     await fs.unlink(path);
      //   } catch {
      //     // file doesn't exist yet - all good
      //   }
      //
      //   // write region file
      //   await fs.appendFile(path, regionDoc.end());
      //   console.info(`Wrote "${path}"`);
      // }
      //
      // // write all regions into one file with kml folders
      // const path = `out/${toFilename("all_tracks")}.kml`;
      // await fs.writeFile(path, masterDoc.end());
      // console.info(`Wrote "${path}"`);
    }
  }
}
