const fs = require("fs").promises;
const builder = require("xmlbuilder");
const mustache = require("mustache");
const minify = require("html-minifier").minify;
const nzgdToWsg = require("./nzgd2000ToWsg86").nzgd2000ToWsg86;
require("dotenv").config();

if (!process.env.DOC_API_KEY_TRACKS) {
  throw new Error("API key not specified in /.env file, refer to .env.sample");
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/*

// wrap in async function
(async () => {
  console.info("Fetching tracks...");

  const endpoint = new DocTracksRepository();
  const tracks = await endpoint.getAll();
  for (const track of tracks) {
    track.details;
  }

  const regionPlacemarks = {};
  const joinChar = ", ";
  const tracksTotal = tracks.length;
  let tracksTally = 0;

  console.info(`Total tracks to process: ${tracksTotal}`);

  /!**
   *
   * @param trackOverview Object {
            "assetId": string,
            "name": string,
            "region": string[],
            "x": float,
            "y": float,
            "line": [[float, float][]]
          }
   * @param queueNumber
   * @returns {Promise<xmlbuilder.XMLElement>}
   *!/
  const getTrackPlacemark = async (trackOverview, queueNumber) => {
    const trackDetails = await sendGetRequest(
      getTracksDetailUrl(trackOverview.assetId)
    );
    let track = { ...trackOverview, ...trackDetails };

    // generate description html
    track.permittedActivities = track.permittedActivities.join(joinChar);
    track.regionArr = track.region;
    track.region = track.region.join(joinChar);
    track.walkTrackCategory = track.walkTrackCategory.join(joinChar);
    track.mtbTrackCategory = track.mtbTrackCategory.join(joinChar);
    const descriptionHtml = minify(
      mustache.render(trackDescriptionTemplate, track),
      {
        removeComments: true,
        removeEmptyAttributes: true,
        removeEmptyElements: true,
        removeTagWhitespace: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true
      }
    );

    const placemarkElement = builder
      .create("Placemark")
      .element("name", null, track.name)
      .up()
      .element("description")
      .cdata(descriptionHtml)
      .up()
      .element("MultiGeometry");

    // convert and add coordinates
    for (const line of track.line) {
      const lineElement = builder
        .create("LineString")
        .element(
          "coordinates",
          null,
          line.map(c => nzgdToWsg(c).join()).join(" ")
        );

      placemarkElement.importDocument(lineElement);
    }

    console.info(
      `[${++tracksTally}/${tracksTotal}] Processed job #${queueNumber} "${
        trackOverview.name
      }", "${trackOverview.region.join(joinChar)}"`
    );

    return placemarkElement;
  };

  console.info("Queuing jobs...");

  let queueNum = 0;
  for (const trackOverview of tracks) {
    for (const region of trackOverview.region) {
      if (!regionPlacemarks[region]) {
        regionPlacemarks[region] = [];
      }

      // push a promise to region object, we will resolve later
      regionPlacemarks[region].push(
        getTrackPlacemark(trackOverview, ++queueNum)
      );
    }
  }

  // todo: pretty sure there is a better way to await an array of promises at once
  // await for all tracks to generate
  for (const key in regionPlacemarks) {
    for (let idx in regionPlacemarks[key]) {
      regionPlacemarks[key][idx] = await regionPlacemarks[key][idx];
    }
  }

  console.info("Generating files...");

  const kmlHeaders = {
    xmlns: "http://www.opengis.net/kml/2.2",
    "xmlns:gx": "http://www.google.com/kml/ext/2.2",
    "xmlns:atom": "http://www.w3.org/2005/Atom"
  };
  let masterDoc = builder
    .create("kml", kmlHeaders)
    .element("Document")
    .element("name", null, "DOC Tracks")
    .up();

  // write each region
  for (const region in regionPlacemarks) {
    const regionDoc = builder
      .create("kml", kmlHeaders)
      .element("Document")
      .element("name", null, `${region} tracks`)
      .up();

    // store reference to xml folder
    masterDoc = masterDoc
      .element("Folder")
      .element("name", null, region)
      .up();

    // append tracks to documents
    for (const placemarkDocument of regionPlacemarks[region]) {
      masterDoc.importDocument(placemarkDocument);
      regionDoc.importDocument(placemarkDocument);
    }

    // restore masterDoc reference to root
    masterDoc = masterDoc.up();

    const path = `out/${toFilename(region)}.kml`;

    try {
      // delete existing file
      await fs.unlink(path);
    } catch {
      // file doesn't exist yet - all good
    }

    // write region file
    await fs.appendFile(path, regionDoc.end());
    console.info(`Wrote "${path}"`);
  }

  // write all regions into one file with kml folders
  // todo: to writeKmlFile function
  const path = `out/${toFilename("all_tracks")}.kml`;
  await fs.writeFile(path, masterDoc.end());
  console.info(`Wrote "${path}"`);

  console.log("Done");
})();
*/
