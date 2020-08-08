import { it } from "mocha";
import { assert } from "chai";
import { nzgdToWsg86 } from "../coord-converter";

describe("Coordinate conversion", () => {
  it("should convert NZGD2000 coordinates to WSG86 coordinate system", function() {
    const converted = nzgdToWsg86([1570650.8507, 5446794.6762]);
    const expected = [172.65034155794453, -41.12962129641851];

    assert.deepEqual(converted, expected);
  });
});
