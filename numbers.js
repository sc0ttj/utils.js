/* ==== Functions for working with **Numbers** ==== */

const { PI, cos, sin, tan, atan2 } = Math;
const pi = Math.PI;

// round num to given decimal places
const decimalFormat = (num, places) => ~~(Math.pow(10, places) * num) / Math.pow(10, places);

/* Circles and degrees */
const circumference = radius => 2 * Math.PI * radius;
const rad = x => x * Math.PI / 180;        // degree to radian
const deg = x => x * 180 / Math.PI;        // radian to degree
const cosd = x => Math.cos(rad(x));        // cosine of the specified angle in degrees
const sind = x => Math.sin(rad(x));        // sine of the specified angle in degrees
const tand = x => Math.tan(rad(x));        // tangent of the specified angle in degrees
const atan2d = (y, x) => deg(atan2(y, x)); // arc-tangent (atan2) in degrees

const acos = x => x > 1 ? 0 : x < -1 ? Math.PI : Math.acos(x);
const asin = x => x > 1 ? (Math.PI / 2) : x < -1 ? -(Math.PI / 2) : Math.asin(x);

// Get a value between two values
const clamp = (num, min, max) => {
    if (num < min) return min;
    if (num > max) return max;
    return num;
};

// Get the distance between two points (supports 2d points, 3d points, etc).
// Just make sure both arrays have the same length:
//   euclideanDistance([1, 1], [2, 3]);       // ~2.2361
//   euclideanDistance([1, 1, 1], [2, 3, 2]); // ~2.4495
const euclideanDistance = (a, b) => Math.hypot(...Object.keys(a).map(k => b[k] - a[k]));

// Get the distance between two 2d points 
const manhattanDistance = (x1, y1, x2, y2) => Math.abs(x2–x1) + Math.abs(y2–y1);

// Get odd or even numbers only
const isOdd = num => num % 2 === 1;
const isEven = num => num % 2 === 0;

// get the mean average of all the give numbers
const getMeanAverage = (...nums) => nums.reduce((a, b) => a + b) / nums.length;

// Linear interpolation, for animation
const lerp = (a, b, t) => (b - a) * t + a;
const inverseLerp = (a, b, t) => (t - a) / (b - a);
const lerp2d = (x1, y1, x2, y2, t) => lerp(x2, y2, inverseLerp(x1, y1, t));

// re-scale a value on one scale, to the equivalant value on another scale
// example:  rescale(37, 0,248, 0,1)  // scales 37, in range 0-248, as a value in range 0-1
const rescale = (num, min,max, scaleMin,scaleMax) => {
  return (num - min) * (scaleMax - scaleMin) / (max - min) + scaleMin;
}

// re-scale or "normalize" any number to a range of 0.0 to 1.0
const rescaleToPercent = (num, min, max) => rescale(num, min,max, 0,1.0);

// Round to given precision
const roundTo = (num, x) => Math.round((num - 10) / x) * x;

// returns a -1 for negative numbers, and 1 for positive numbers
const sign = (x) => typeof x === 'number' ? x ? x < 0 ? -1 : 1 : 0 : NaN;

// Unit conversion functions
const celsiusToFahrenheit = (celsius) => celsius * 9/5 + 32;
const fahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;
const kmToMiles = (km) => km * 0.621371192;
const milesToKm = (mi) => mi * 1.609344;
const kmToNauticalMiles = km => km / 1.852216;

// conversion factors 
const temperatureConversion = {
  c: 1,
  celcius: 1,
  f: 1 * 9/5 + 32
  fahrenheit: 1 * 9/5 + 32
};

const distanceConversion = {
    m: 1,
    meters: 1,
    metres: 1,
    km: 0.001,
    kilometers: 0.001,
    kilometres: 0.001,
    cm: 100,
    centimeters: 100,
    centimetres: 100,
    mm: 1000,
    mi: 1 / 1609.344,
    miles: 1 / 1609.344,
    sm: 1 / 1852.216,
    nauticalmiles: 1 / 1852.216,
    ft: 100 / 30.48,
    feet: 100 / 30.48,
    in: 100 / 2.54,
    inches: 100 / 2.54,
    yd: 1 / 0.9144,
    yards: 1 / 0.9144,
};

const convertDistance = (meters, targetUnit = 'm') => {
    const factor = distanceConversion[targetUnit];
    if (factor) return meters * factor;
    throw new Error('Invalid unit used for distance conversion.');
};

const timeConversion = {
    s: 1,
    seconds: 1,
    m: 60,
    mins: 60,
    minutes: 60,
    h: 3600,
    hours: 3600,
    d: 86400,
    days: 86400,
};

const convertTime = (seconds, targetUnit = 's') => {
    const factor = timeConversion[targetUnit];
    if (factor) return seconds * factor;
    throw new Error('Invalid unit used for time conversion.');
};

const convertSpeed = (metersPerSecond, targetUnit = 'kmh') => {
    switch (targetUnit) {
        case 'kmh':
            return metersPerSecond * timeConversion.h * distanceConversion.km;
        case 'mph':
            return metersPerSecond * timeConversion.h * distanceConversion.mi;
        default:
            return metersPerSecond;
    }
};

const areaConversion = {
    acres: 0.000247105,
    cm: 10000,
    centimeters: 10000,
    centimetres: 10000,
    ft: 10.763910417,
    feet: 10.763910417,
    hectares: 0.0001,
    in: 1550.003100006,
    inches: 1550.003100006,
    km: 0.000001,
    kilometers: 0.000001,
    kilometres: 0.000001,
    m: 1,
    meters: 1,
    metres: 1,
    mi: 3.86e-7,
    miles: 3.86e-7,
    mm: 1000000,
    millimeters: 1000000,
    millimetres: 1000000,
    nm: 2.9155334959812285e-7,
    nauticalmiles: 2.9155334959812285e-7,
    yd: 1.195990046,
    yards: 1.195990046,
};

const convertArea = (metersSquared, targetUnit = 'm') => {
    const factor = areaConversion[targetUnit];
    if (!factor) throw new Error('Invalid unit used for area conversion.');
    return squareMeters * factor;
};