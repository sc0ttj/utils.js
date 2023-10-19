//
// Map specification & definition related stuff
//

// Note:
//
// - The Earths equitorial radius is bigger than its polar radius: it's fatter round the waist.
// - Some systems assume the earth is a perfect sphere, others don't.


// Earths mean radius, according to other map tools

const GOOGLE_MEAN_RADIUS_KM = 6_371.0710;              // NOT USED, just for reference/comparison
const TURFJS_MEAN_RADIUS_KM = 6_371.0088;              // NOT USED, just for reference/comparison
const MAPBOX_MEAN_RADIUS_KM = 6_371.0088;              // NOT USED, just for reference/comparison
const NASA_MEAN_RADIUS_KM   = 6_371.0087714;           // NOT USED, just for reference/comparison 



// Earth constants, defined by the WGS84 standard

const WGS84_MEAN_RADIUS = 6_371_000.0;                  // mean radius (metres) used by web mercator, haversine, etc
const WGS84_RADIUS_MAJOR = 6_378_137.0;                 // semi-major axis / equatorial radius (metres)
const WGS84_RADIUS_MINOR = 6_356_752.314245;            // semi-minor axis / polar radius (metres)
const WGS84_FLATTENING = 1 / 298.257223563;             // inverse flattening
const WGS84_ECC_SQUARED = 0.006694380004260827;         // first eccentricity Squared
const WGS84_EQUATORIAL_CIRCUMFERENCE: 40_075_016.68557; // equatorial circumference (meters).
const WGS84_MIN_ELEVATION: -433.0;                      // lowest point on earth, the Dead Sea (meters).
const WGS84_MAX_ELEVATION: 8_848.0;                     // highest point on earth, Mt. Everest (meters).
const WGS84_MAX_BUILDING_HEIGHT: 828;                   // highest building on earth, Burj Khalifa tower in Dubai (meters).
const WGS84_SATELLITE_ORBIT = 20_180_000;               // altitude of satellites (meters)
const WGS84_GRAVITY_M = 9.81;                           // m/s2 (that’s meters, per second, per second)
const WGS84_GRAVITY_FT = 32.1740;                       // ft/s2 (feet per second, per second)

const squared = x => x * x;
const WGS84_RADIUS_MAJOR² = squared(WGS84_RADIUS_MAJOR);
const WGS84_RADIUS_MINOR² = squared(WGS84_RADIUS_MINOR);
const WGS84_RADIUS_FACTOR = (WGS84_RADIUS_MAJOR² - WGS84_RADIUS_MINOR²) / WGS84_RADIUS_MINOR²;



// Reference Ellipsoids
//
// "Official" approximations of the Earths shape and size, as defined by various coordinate and mapping systems.

//   (a) semi-major axis - equatorial radius, in metres
//   (b) semi-minor axis - polar radius, in metres
//   (f) flattening      - inverse flattening ratio, where f = (a−b)/a

const ellipsoids = {
    WGS84:         { a: 6_378_137.0,      b: 6_356_752.314245, f: 1/298.257223563 }, // Mercator
    Sphere:        { a: 6_378_137.0,      b: 6_378_137.0       f: 0               }, // Web/Google/Pseudo-Mercator
    Airy1830:      { a: 6_377_563.396,    b: 6_356_256.909,    f: 1/299.3249646   }, // UK (OSGB36 National Grid)
    AiryModified:  { a: 6_377_340.189,    b: 6_356_034.448,    f: 1/299.3249646   }, // Ireland (Irl1975)
    Mars:          { a: 6_792_400,        b: 6_752_400,        f: 1/170.0         }, // NASA
    Moon:          { a: 1_737_400,        b: 1_737_400,        f: 0               }, // NASA
    Sun:           { a: this.WGS84.a*109, b: this.WGS84.a*109, f: 0               }, // NASA
};



// Map "Datums" 
//
// A reference ellipsoid, along with a defined coordinate system to navigate it, is a "Datum".

const datum = {
    WGS84: {                                // the name of the datum 
      id: 'EPSG:4326',                      // the EPSG ID
      ellipsoid: ellipsoids.WGS84,          // the standard WGS84 ellipsoid
      type: 'ellipsoidal',                  // the type of coordinate system
      x: 'longitude',                       // the x axis (easting) name 
      y: 'latitude',                        // the y axis (northing) name
      axes:   { x: 'east', y: 'north'  },   // the axes orientation of the coordinate system
      center: { x:    0,   y:    0     },   // the center point of the coordinate system
      min:    { x: -180,   y:  -90     },   // the min axis values (the extent or bounds)
      max:    { x: +180,   y:  +90     },   // the max axis values (the extent or bounds)
      invert: { x: false,  y: true     },   // left is -180, right is 180, top is -90, bottom is 90
      wrap:   { x: true,   y: true     },   // wrap around both axes, as WG84 earth is a globe
      units:  { a: 'deg',  d: 'meters' },   // the units used for angles, distances
    },
};



// Map "Projections"
//
// Convert latlongs on a sphere or ellipsoid, to xy pixel points on a flat surface.
// Each projection includes a datum, and may override datum properties.

const latlng = {
  // nice looking world maps, like Robinson but conformal and faster
  equalEarth: {},

  // a.k.a unprojected - twice as wide as it is tall
  equiRectangular: {},

  // single countries
  geoAlbers: {},

  // proper mercator - let's cheat, derive this from spherical mercator
  mercator: {},

  // Pseudo-mercator / Google mercator / Spherical mercator 
  webMercator: {
    ...datum.WGS84,                   // the datum used by this projection
    // override datum
    id: 'EPSG:3857',                  // the EPSG ID
    ellipsoid: ellipsoids.Sphere,     // the reference ellipsoid
    type:  'cartesian',               // projects to a flat 2d grid
    min:   { x: -180, y: -85.06  },   // the min lon,lat (the extent or bounds)
    max:   { x: +180, y:  85.06  },   // the max lon,lat(the extent or bounds)
    wrap:  { x: true, y:  false  },   // only wrap east to west
    // methods
    toPixel(lon, lat) {},             // convert latlngs to pixels
    toLatLng(x, y, z) {},             // convert pixels to latlngs
  },
};

// ...later

// const { toPixel, toLatLng } = latlng.mercator;
//
// const [ x, y ] = toPixel(lng, lat);
//
// const [ lng, lat ] = toLatLng(x, y, zoom);


// Functions for working with coordinates
//
//

// Convert coordinates to a valid GeoJSON [lng,lat] array format, from the given format:
//   
//    const point = { latitiude: 51.05 , longitude: 34.4 };
//    const [ lng, lat ] = validCoordsFrom(point, '{ latitude, longitude }');

const validCoordsFrom = (coords, format = '[lat,lng]') => {
  format = format.replaceAll(' ', '').toLowerCase(); // remove spaces, make lower case
  switch (format) {
    case '[latitude,longitude]':
    case '[lat,lng]':
    case '[lat,lon]':
    case '[lat,long]':
      return [ coords[1], coords[0] ];
    case '{longitude,latitude}':
    case '{latitude,longitude}':
      return [ coords.longitude, coords.latitude ];
    case '{lon,lat}':
    case '{lat,lon}':
      return [ coords.lon, coords.lat ];
    case '{lat,lng}':
    case '{lng,lat}':
      return [ coords.lng, coords.lat ];
    case '{long,lat}':
    case '{lat,long}':
      return [ coords.long, coords.lat ];
    case 'geojson':
      return [ coords.geometry.coordinates[0], coords.geometry.coordinates[1] ];
    default:
      return coords;
  }
};



// Geospatial functions
//
//

// temp, just for reference
const haversine_RADII = {
  km:    6371,
  mile:  3960,
  meter: 6371000,
  nmi:   3440
}

// degrees to radians
const rad = deg => (deg * Math.PI) / 180;

// radians to degrees
const deg = rad => (rad * 180) / Math.PI;

// Get the distance between two points on a sphere
function haversineDistance(lon1, lat1, lon2, lat2, earthRadius = WGS84_MEAN_RADIUS) {
  const radians = Math.PI / 180;
  lon1 *= radians;
  lat1 *= radians;
  lon2 *= radians;
  lat2 *= radians;

  const diam = 2 * earthRadius; // Diameter of the earth in km is 12742 (2 * 6371)
  const dLon = lon2 - lon1;
  const dLat = lat2 - lat1;

  const a = (
    (1 - Math.cos(dLat)) +
    (1 - Math.cos(dLon)) * Math.cos(lat1) * Math.cos(lat2)
  ) / 2;

  return diam * Math.asin(Math.sqrt(a));
}

// Get the distance between two points on a sphere (more accurate but slower than the "haversine distance" method)
// adapted from https://gist.github.com/ed-flanagan/d4048ba6896ce340ab9d
function vincentyDistance(lon1, lat1, lon2, lat2, earthRadius = WGS84_MEAN_RADIUS) {
    const earthRadiusKm = earthRadius / 1000;
    const radians = Math.PI / 180;
    lon1 *= radians;
    lat1 *= radians;
    lon2 *= radians;
    lat2 *= radians;

    const { abs, atan2, cos, pow, sin, sqrt } = Math;

    const d_lon = abs(lon1 - lon2);

    // Numerator
    const a = pow(cos(lat2) * sin(d_lon), 2.0);
    const b = cos(lat1) * sin(lat2);
    const c = sin(lat1) * cos(lat2) * cos(d_lon);
    const d = pow(b - c, 2.0);
    const e = sqrt(a + d);

    // Denominator
    const f = sin(lat1) * sin(lat2);
    const g = cos(lat1) * cos(lat2) * cos(d_lon);
    const h = f + g;

    const d_sigma = atan2(e, h);

    return (earthRadiusKm * d_sigma);
}

// Validate the units given
// Adapted from https://github.com/mwgg/GreatCircle/blob/master/GreatCircle.js
function validateEarthRadius(unit) {
    unit = unit.toLowerCase();
    const radius = { 
      'm': 6_371_008.7714, 
      'meters': 6_371_008.7714, 
      'metres': 6_371_008.7714, 
      'km': 6_371.009, 
      'kilometers': 6_371.009, 
      'kilometres': 6_371.009, 
      'mi': 3_958.761, 
      'miles': 3_958.761, 
      'nm': 3_440.070, 
      'nuaticalmiles': 3_440.070, 
      'yd': 6_967_420, 
      'yards': 6_967_420, 
      'ft': 20_902_260,
      'feets': 20_902_260,
    };
    if (unit in radius) return radius[unit];
    else throw Error(`Not a valid unit: ${unit}`);
}

