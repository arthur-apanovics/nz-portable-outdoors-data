import { DocItemWriterBase } from "./docItemWriterBase";
import { DocTrack } from "./docTrack";
import xmlbuilder from "xmlbuilder";

export class DocTrackWriter extends DocItemWriterBase<DocTrack> {
  protected async getKmlPlacemarkElementAsync(
    track: DocTrack
  ): Promise<xmlbuilder.XMLElement> {
    const placemark = xmlbuilder
      .create("Placemark")
      .element("name", null, track.name)
      .up()
      .element("description")
      .cdata(await track.getDetailsHtmlAsync())
      .up()
      .element("MultiGeometry");

    // convert and add coordinates
    for (const line of track.getLineAsWsg86()) {
      placemark.importDocument(
        xmlbuilder
          .create("LineString")
          .element("coordinates", null, line.join(" "))
      );
    }

    return placemark;
  }
}
