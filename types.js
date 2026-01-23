/* ==== misc, generic helper functions ==== */

const type = v => Array.isArray(v) ? 'array' : Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
const isType = (v, t) => type(v) === t;

// --- Primitives ---
const isUndefined = v => isType(v, 'undefined');
const isNull = v => isType(v, 'null');
const isBoolean = v => isType(v, 'boolean');
const isString = v => isType(v, 'string');
const isSymbol = v => isType(v, 'symbol');
const isBigInt = v => isType(v, 'bigint');
const isPrimitive = v => v !== Object(v);

// --- Numbers ---
const isNum = v => isType(v, 'number');
const isInteger = v => Number.isInteger(v);
const isSafeInteger = v => Number.isSafeInteger(v);
const isFloat = v => isNum(v) && !Number.isInteger(v) && Number.isFinite(v);
const isZero = v => v === 0;
const isPositiveInteger = v => isInteger(v) && v > 0;
const isNegativeInteger = v => isInteger(v) && v < 0;
const isInfinite = v => v === Infinity || v === -Infinity;
const isNaNValue = v => Number.isNaN(v);
const isNumeric = v => !isNaNValue(parseFloat(v)) && isFinite(v);
const isEven = v => isInteger(v) && v % 2 === 0;
const isOdd = v => isInteger(v) && Math.abs(v % 2) === 1;

// --- Objects & Functions ---
const isObj = v => isType(v, 'object');
const isPlainObject = v => isObj(v) && v.constructor === Object;
const isFn = v => typeof v === 'function';
const isAsyncFn = v => isType(v, 'asyncfunction');
const isGeneratorFn = v => isType(v, 'generatorfunction');
const isAnyFn = v => isFn(v) || isAsyncFn(v) || isGeneratorFn(v);
const isDate = v => isType(v, 'date');
const isRegExp = v => isType(v, 'regexp');
const isError = v => isType(v, 'error');
const isPromise = v => isType(v, 'promise');

// --- Collections ---
const isArray = v => Array.isArray(v);
const isSet = v => isType(v, 'set');
const isMap = v => isType(v, 'map');
const isWeakSet = v => isType(v, 'weakset');
const isWeakMap = v => isType(v, 'weakmap');
const isIterable = v => v !== null && typeof v[Symbol.iterator] === 'function';
const isAsyncIterable = v => v !== null && typeof v[Symbol.asyncIterator] === 'function';

// --- Structured Data & Buffers ---
const isArrayBuffer = v => isType(v, 'arraybuffer');
const isDataView = v => isType(v, 'dataview');
const isTypedArray = v => ArrayBuffer.isView(v) && !isType(v, 'dataview');
const isJSON = v => { try { JSON.stringify(v); return true; } catch { return false; } };

// --- Web API & Browser Types ---
const isURL = v => isType(v, 'url');
const isBlob = v => isType(v, 'blob');
const isFile = v => isType(v, 'file');
const isFormData = v => isType(v, 'formdata');
const isElement = v => typeof HTMLElement !== 'undefined' && v instanceof HTMLElement;

// --- Logic & Composition (Higher-Order Functions) ---
const isNot = (fn) => (v) => !fn(v);
const isAnd = (...fns) => (v) => fns.every(fn => fn(v));
const isOr = (...fns) => (v) => fns.some(fn => fn(v));
const isArrayOf = (fn) => (v) => isArray(v) && v.every(fn);

// --- Array Content Checks ---
const isArrayOfStrings = v => isArray(v) && v.every(isString);
const isArrayOfObjects = v => isArray(v) && v.every(isObj);
const isArrayOfNumbers = v => isArray(v) && v.every(isNum);
const isArrayOfIntegers = v => isArray(v) && v.every(isInteger);
const isArrayOfFloats = v => isArray(v) && v.every(isFloat);
const isArrayOfBooleans = isArrayOf(isBoolean);
const isArrayOfDates = isArrayOf(isDate);

// --- Emptiness Checks ---
const isEmptyString = v => isString(v) && v.trim().length === 0;
const isEmptyArray = v => isArray(v) && v.length === 0;
const isEmptyObject = v => isObj(v) && Object.keys(v).length === 0;
const isEmptySet = v => isSet(v) && v.size === 0;
const isEmptyMap = v => isMap(v) && v.size === 0;
const isNonEmptyString = isAnd(isString, isNot(isEmptyString));

// --- Environment Checks ---
const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
