// This was unceremoniously ripped out of the proj4 package
// to perform only necessary calculations for performance reasons
// because we'll be converting thousands of coordinates.
// https://github.com/proj4js/proj4js

/**
 * Converts NZGD2000 coordinate system values to standard WSG86.
 *
 * @param xyArray [number, number]
 * @returns [number, number]
 */
export function nzgdToWsg86(xyArray: [number, number]): [number, number] {
  const SPI = 3.14159265359;
  const TWO_PI = Math.PI * 2;
  const HALF_PI = Math.PI / 2;
  const R2D = 57.29577951308232088;
  const EPSLN = 1.0e-10;

  const source = {
    projName: "tmerc",
    lat0: 0,
    long0: 3.01941960595019,
    k0: 0.9996,
    x0: 1600000,
    y0: 10000000,
    ellps: "GRS80",
    datum_params: [0, 0, 0, 0, 0, 0, 0],
    units: "m",
    no_defs: true,
    axis: "enu",
    names: ["Transverse_Mercator", "Transverse Mercator", "tmerc"],
    a: 6378137,
    b: 6356752.314140356,
    rf: 298.257222101,
    es: 0.006694380022900686,
    e: 0.08181919104281517,
    ep2: 0.006739496775478856,
    datum: {
      datum_type: 5,
      datum_params: [0, 0, 0, 0, 0, 0, 0],
      a: 6378137,
      b: 6356752.314140356,
      es: 0.006694380022900686,
      ep2: 0.006739496775478856
    },
    en: [
      0.9983242984231332,
      0.005018678446033867,
      0.00002100298118440739,
      1.0936603552691419e-7,
      6.178058939352553e-10
    ],
    ml0: 0
  };

  const sign = function(x) {
    return x < 0 ? -1 : 1;
  };

  const adjust_lon = function(x) {
    return Math.abs(x) <= SPI ? x : x - sign(x) * TWO_PI;
  };

  const pj_mlfn = function(phi, sphi, cphi, en) {
    cphi *= sphi;
    sphi *= sphi;
    return (
      en[0] * phi -
      cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4])))
    );
  };

  const pj_inv_mlfn = function(arg, es, en) {
    const MAX_ITER = 20;

    const k = 1 / (1 - es);
    let phi = arg;
    for (let i = MAX_ITER; i; --i) {
      /* rarely goes over 2 iterations */
      const s = Math.sin(phi);
      let t = 1 - es * s * s;
      t = (pj_mlfn(phi, s, Math.cos(phi), en) - arg) * (t * Math.sqrt(t)) * k;
      phi -= t;
      if (Math.abs(t) < EPSLN) {
        return phi;
      }
    }
    return phi;
  };

  /**
   Transverse Mercator Inverse  -  x/y to long/lat
   */
  function inverse$2(p) {
    let con, phi;
    let lat, lon;
    const x = (p.x - source.x0) * (1 / source.a);
    const y = (p.y - source.y0) * (1 / source.a);

    // ellipsoidal form
    con = source.ml0 + y / source.k0;
    phi = pj_inv_mlfn(con, source.es, source.en);

    if (Math.abs(phi) < HALF_PI) {
      const sin_phi = Math.sin(phi);
      const cos_phi = Math.cos(phi);
      const tan_phi = Math.abs(cos_phi) > EPSLN ? Math.tan(phi) : 0;
      const c = source.ep2 * Math.pow(cos_phi, 2);
      const cs = Math.pow(c, 2);
      const t = Math.pow(tan_phi, 2);
      const ts = Math.pow(t, 2);
      con = 1 - source.es * Math.pow(sin_phi, 2);
      const d = (x * Math.sqrt(con)) / source.k0;
      const ds = Math.pow(d, 2);
      con = con * tan_phi;
      lat =
        phi -
        ((con * ds) / (1 - source.es)) *
          0.5 *
          (1 -
            (ds / 12) *
              (5 +
                3 * t -
                9 * c * t +
                c -
                4 * cs -
                (ds / 30) *
                  (61 +
                    90 * t -
                    252 * c * t +
                    45 * ts +
                    46 * c -
                    (ds / 56) *
                      (1385 + 3633 * t + 4095 * ts + 1574 * ts * t))));

      lon = adjust_lon(
        source.long0 +
          (d *
            (1 -
              (ds / 6) *
                (1 +
                  2 * t +
                  c -
                  (ds / 20) *
                    (5 +
                      28 * t +
                      24 * ts +
                      8 * c * t +
                      6 * c -
                      (ds / 42) *
                        (61 + 662 * t + 1320 * ts + 720 * ts * t))))) /
            cos_phi
      );
    } else {
      lat = HALF_PI * sign(y);
      lon = 0;
    }

    p.x = lon;
    p.y = lat;

    return p;
  }

  const point = inverse$2({ x: xyArray[0], y: xyArray[1] });
  // convert radians to decimal degrees

  return [point.x * R2D, point.y * R2D];
}
