/* ==== misc, generic helper functions ==== */

const type = v => Array.isArray(v) ? 'array' : Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
const isType = (v,t) => type(v) === t;
const isFn = v => isType(v, 'function');
const isObj = v => isType(v, 'object');
const isNum = v => isType(v, 'number');
const isNull = v => isType(v, 'null');
const isArray = v => Array.isArray(v);
