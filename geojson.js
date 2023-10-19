//
// Functions for working with GeoJSON
//


// clone the given object, return the cloned object
const clone = obj => {
 return typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));
};

// sort GeoJSON features by the given property and order
const sortByProp = (gj, prop, order) => gj.features.sort((a,b) => {
  // get the values
  a = a.properties[prop];
  b = b.properties[prop];
  if (typeof a === 'string' && typeof b === 'string') {
    // sort strings
    return order === 'asc' 
      ? a > b ? 1 : -1 
      : b > a ? 1 : -1;
  } 
  else {
    // sort numbers
    return order === 'asc' ? a - b : b - a;
  }
});


// for each feature in the given GeoJSON, replace the value of the given key with the 
// value returned by the given callback. 
const setKey = (gj, key, cb) => gj.features.map(f => ({ ...f, [key]: cb(f, f[key]) }));

// replace the bbox array of each feature with the array supplied by the given callback
const setBbox = (gj, cb) => setKey(gj, 'bbox', cb);

// replace the id of each feature with the id by the given callback
const setId = (gj, cb) => setKey(gj, 'id', cb);

// replace the geometry of each feature with the object supplied by the given callback
const setGeometry = (gj, cb) => setKey(gj, 'geometry', cb);

// replace the properties object of each feature with the object supplied by the given callback
const setProps = (gj, cb) => setKey(gj, 'properties', cb);



// is point inside bbox - accounts for crossing anti-merdian (left/right edges of world,  the Antimeridian (180° E or 180° W))
// from https://stackoverflow.com/a/29893828
// takes bbox bottom-left, top-right, and the point
//
function pointInBoundingBox(bl, tr, p) {
    // account for crossing antimeridian
    let isLongInRange;
    // [0] is lon
    // [1] is lat
    if (tr[0] < bl[0]) {
      isLongInRange = p[0] >= bl[0] || p[0] <= tr[0]
    } else {
      isLongInRange = p[0] >= bl[0] && p[0] <= tr[0]
    }
    return (p[1] >= bl[1]  &&  p[1] <= tr[1]  && isLongInRange);
}


// https://github.com/iominh/point-in-polygon-extended
// **best method is "winding number"**
function isLeft(p0, p1, p2) {
  return ((p1[0] - p0[0]) * (p2[1] - p0[1])) -
         ((p2[0] - p0[0]) * (p1[1] - p0[1]));
}

function pointInPolyWindingNumber(point, polygon) {
  if (polygon.length === 0) return false;

  let wn = 0; // wn counter
  let n = polygon.length;
  let newPoints = polygon.slice(0);
  newPoints.push(polygon[0]);

  // loop through all edges of the polygon
  for (let i = 0; i < n; i++) {
    if (newPoints[i][1] <= point[1]) {
      if (newPoints[i + 1][1] > point[1]) {
        if (isLeft(newPoints[i], newPoints[i + 1], point) > 0) {
          wn++;
        }
      }
    } else {
      if (newPoints[i + 1][1] <= point[1]) {
        if (isLeft(newPoints[i], newPoints[i + 1], point) < 0) {
          wn--;
        }
      }
    }
  }
  // the point is outside only when this winding number wn===0, otherwise it's inside
  return wn !== 0;
}

// Checks if a point is contained in a polygon
// (based on the Jordan curve theorem), for more info:
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
function pointInPolyRaycast(point, polygon) {
  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i][0], yi = polygon[i][1];
    var xj = polygon[j][0], yj = polygon[j][1];

    var intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

// use the best one
const pointInPolygon = pointInPolyWindingNumber;