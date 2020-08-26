import render from "preact-render-to-string";
import { h } from "preact";
import { DocTrack } from "../../models/docTrack";
import { getDocItemTable } from "../docItemTable";

export default (track: DocTrack): string => {
  return render(getDocItemTable(track));
};
