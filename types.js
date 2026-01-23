/* ==== misc, generic helper functions ==== */

const type = v => Array.isArray(v) ? 'array' : Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
const isType = (v, t) => type(v) === t;

// --- Primitives ---
const isUndefined = v => isType(v, 'undefined');
const isNull = v => isType(v, 'null');
const isDefined = v => !isUndefined(v) && !isNull(v);
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
const isNumeric = v => (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) && !isNaN(v);
const isEven = v => isInteger(v) && v % 2 === 0;
const isOdd = v => isInteger(v) && Math.abs(v % 2) === 1;

// --- Objects & Functions ---
const isObj = v => isType(v, 'object');
const isPlainObject = v => {
    if (!isObj(v)) return false;
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
};
const isFrozen = v => Object.isFrozen(v);
const isSealed = v => Object.isSealed(v);
const isExtensible = v => Object.isExtensible(v);
const isImmutable = v => isPrimitive(v) || (isFrozenValue(v) && Object.values(v).every(isImmutable));
const isClass = v => isFn(v) && /^\s*class\s+/.test(v.toString());
const isFn = v => isType(v, 'function') || isAsyncFn(v) || isGeneratorFn(v);
const isAsyncFn = v => isType(v, 'asyncfunction');
const isGeneratorFn = v => isType(v, 'generatorfunction');
const isDate = v => isType(v, 'date');
const isDateValid = v => isDate(v) && !isNaN(v.getTime());
const isRegExp = v => isType(v, 'regexp');
const isError = v => (typeof Error.isError === 'function') ? Error.isError(v) : isType(v, 'error');
const isPromise = v => isType(v, 'promise');
const isThenable = v => v !== null && (isObj(v) || isFn(v)) && isFn(v.then);

// --- Collections ---
const isArray = v => Array.isArray(v);
const isTypedArray = v => ArrayBuffer.isView(v) && !isType(v, 'dataview');
const isInt8Array = v => isType(v, 'int8array');
const isUint8Array = v => isType(v, 'uint8array');
const isUint8ClampedArray = v => isType(v, 'uint8clampedarray');
const isInt16Array = v => isType(v, 'int16array');
const isUint16Array = v => isType(v, 'uint16array');
const isInt32Array = v => isType(v, 'int32array');
const isUint32Array = v => isType(v, 'uint32array');
const isFloat32Array = v => isType(v, 'float32array');
const isFloat64Array = v => isType(v, 'float64array');
const isBigInt64Array = v => isType(v, 'bigint64array');
const isBigUint64Array = v => isType(v, 'biguint64array');
const isSet = v => isType(v, 'set');
const isMap = v => isType(v, 'map');
const isWeakSet = v => isType(v, 'weakset');
const isWeakMap = v => isType(v, 'weakmap');
const isIterable = v => v !== null && typeof v[Symbol.iterator] === 'function';
const isAsyncIterable = v => v !== null && typeof v[Symbol.asyncIterator] === 'function';

// --- Structured Data & Buffers ---
const isArrayBuffer = v => isType(v, 'arraybuffer');
const isDataView = v => isType(v, 'dataview');
const isJSON = v => { try { JSON.stringify(v); return true; } catch { return false; } };

// --- Buffer & Memory Management ---
const isSharedArrayBuffer = v => isType(v, 'sharedarraybuffer');
const isTransferable = v => v instanceof ArrayBuffer || v instanceof MessagePort || (typeof ImageBitmap !== 'undefined' && v instanceof ImageBitmap);
const isByteAligned = (v, alignment) => isTypedArray(v) && v.byteOffset % alignment === 0;


// --- Web API & Browser Types ---
const isURL = v => isType(v, 'url');
const isBlob = v => isType(v, 'blob');
const isFile = v => isType(v, 'file');
const isFormData = v => isType(v, 'formdata');
const isElement = v => typeof HTMLElement !== 'undefined' && v instanceof HTMLElement;


// --- Array Content Checks ---
const isArrayOfStrings = v => isArray(v) && v.every(isString);
const isArrayOfObjects = v => isArray(v) && v.every(isObj);
const isArrayOfNumbers = v => isArray(v) && v.every(isNum);
const isArrayOfIntegers = v => isArray(v) && v.every(isInteger);
const isArrayOfFloats = v => isArray(v) && v.every(isFloat);
const isArrayOfBooleans = v => isArray(v) && v.every(isBoolean);
const isArrayOfDates = v => isArray(v) && v.every(isDate);

// --- Map and Set Content Checks ---

// --- Emptiness Checks ---
const isEmptyString = v => isString(v) && v.trim().length === 0;
const isEmptyArray = v => isArray(v) && v.length === 0;
const isEmptyObject = v => isObj(v) && Object.keys(v).length === 0;
const isEmptySet = v => isSet(v) && v.size === 0;
const isEmptyMap = v => isMap(v) && v.size === 0;
const isEmptyBuffer = v => Buffer.isBuffer(v) && v.length === 0;
const isEmptyTypedArray = v => ArrayBuffer.isView(v) && v.length === 0;
const isEmpty = v => {
  if (isNull(v)) return true;
  if (isString(v)) return isEmptyString(v);
  if (isArray(v)) return isEmptyArray(v);
  if (isObj(v)) return isEmptyObject(v);
  if (isSet(v)) return isEmptySet(v);
  if (isMap(v)) return isEmptyMap(v);
  if (Buffer.isBuffer(v)) return isEmptyBuffer(v);
  if (ArrayBuffer.isView(v)) return isEmptyTypedArray(v);
  return false;
};
const isNotEmpty = v => !isEmpty(v);

// --- Environment Checks ---
const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
