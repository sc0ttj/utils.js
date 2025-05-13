/* ==== misc, generic helper functions ==== */

const type = v => Array.isArray(v) ? 'array' : Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
const isType = (v,t) => type(v) === t;
const isFn = v => isType(v, 'function');
const isObj = v => isType(v, 'object');
const isNum = v => isType(v, 'number');
const isInfinite = v => isType(v, 'number') && v === Infinity;
const isNull = v => isType(v, 'null');
const isArray = v => Array.isArray(v);
const isSet = v => isType(v, 'set');
const isMap = v => isType(v, 'map');
const isBoolean = v => isType(v, 'boolean');
const isString = v => isType(v, 'string');
const isInteger = v => isNum(v) && v === +v && v === (v|0);
const isFloat = v => isNum(v) && v === +v && v !== (v|0);
const isZero = v => isNum(v) && v === 0;
const isPositiveInteger = v => isInteger(v) && v > 0;
const isNegativeInteger = v => isInteger(v) && v < 0;
const isArrayOfStrings = v => Array.isArray(v) && v.every(isString);
const isArrayOfObjects = v => Array.isArray(v) && v.every(isObj);
const isArrayOfNumbers = v => Array.isArray(v) && v.every(isNum);
const isArrayOfIntegers = v => Array.isArray(v) && v.every(isInteger);
const isArrayOfFloats = v => Array.isArray(v) && v.every(isFloat);
