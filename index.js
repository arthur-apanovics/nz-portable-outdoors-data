const fs = require("fs").promises;
const got = require("got");
const builder = require("xmlbuilder");
const mustache = require("mustache");
const minify = require("html-minifier").minify;
const nzgdToWsg = require("./nzgd2000ToWsg86").nzgd2000ToWsg86;
require("dotenv").config();

if (!process.env.DOC_API_KEY_TRACKS) {
  throw new Error("API key not specified in /.env file, refer to .env.sample");
}

const _baseUrl = "https://api.doc.govt.nz/v1";
const _tracksUrl = `${_baseUrl}/tracks`;
//todo: const _tracksAlertUrl = `${_tracksUrl}/{id}/alerts`;
const _tracksApiKey = process.env.DOC_API_KEY_TRACKS;

// wrap in async function
(async () => {
  const trackDescriptionTemplate = await fs.readFile(
    "track-details.mustache",
    "utf8"
  );

  const getTracksDetailUrl = uuid => {
    return `${_tracksUrl}/${uuid}/detail`;
  };

  const sendGetRequest = async url => {
    try {
      const response = await got(url, {
        baseUrl: _baseUrl,
        responseType: "json",
        headers: { "x-api-key": _tracksApiKey }
      });

      return response.body;
    } catch (error) {
      if (error.response.statusCode === 429) {
        // too many requests - slow down for a bit
        console.warn(`Too many requests for "${url}", will try again later`);
        // sleep
        await new Promise(resolve => setTimeout(resolve, 2000));

        return await sendGetRequest(url);
      } else {
        throw error;
      }
    }
  };

  const fetchAndCacheTracks = async path => {
    const tracks = await sendGetRequest(_tracksUrl);
    await fs.writeFile(path, JSON.stringify(tracks));

    return tracks;
  };

  const toFilename = string => string.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  console.info("Fetching tracks...");

  // get tracks json
  let tracks = [];
  const tracksCachedFilePath = "cache/tracks.json";
  try {
    const stats = await fs.stat(tracksCachedFilePath);
    const expiryThreshold = 60 * 60 * 24 * 1000; // 24 hours
    if (new Date() - stats.birthtime >= expiryThreshold) {
      // cache is too old
      tracks = await fetchAndCacheTracks(tracksCachedFilePath);
    } else {
      tracks = JSON.parse(await fs.readFile(tracksCachedFilePath, "utf8"));
    }
  } catch (ex) {
    if (ex.errno !== -4058) {
      // not a "file not found" error - throw
      throw ex;
    }

    tracks = await fetchAndCacheTracks(tracksCachedFilePath);
  }

  const regionPlacemarks = {};
  const joinChar = ", ";
  const tracksTotal = tracks.length;
  let tracksTally = 0;

  console.info(`Total tracks to process: ${tracksTotal}`);

  /**
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
   */
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
