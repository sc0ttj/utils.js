/* ==== misc, generic helper functions ==== */

// Reliable but slow "type" getter
// const type = v => Array.isArray(v) ? 'array' : Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

// Reliable and fast "type" getter
const type = v => {
  // 1. Immediate exit for null
  if (v === null) return 'null';

  // 2. Fast-path for raw primitives (Number, String, Boolean, Symbol, BigInt, Undefined)
  const t = typeof v;
  if (t !== 'object' && t !== 'function') return t;

  // 3. Robust Cross-Realm Array check
  if (Array.isArray(v)) return 'array';

  // 4. Handle Boxed Primitives (e.g., new String("test") -> 'string')
  // We check the internal [[PrimitiveValue]] by calling valueOf
  if (v.valueOf) {
    try {
      const val = v.valueOf();
      if (val !== v) {
        const valType = typeof val;
        if (valType !== 'object' && valType !== 'function') return valType;
      }
    } catch (e) {
      // Some host objects might throw on valueOf; ignore and proceed
    }
  }

  // 5. Robust Fallback for Specialized Objects (Date, Map, Set, TypedArrays, etc.)
  // This is cross-realm safe as it checks the internal [[Class]] slot
  const rawTag = Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

  // 6. Handle Functions (Standard, Async, Generator)
  if (t === 'function') {
    // Standardize 'function' tags to avoid variations in older engines
    return rawTag.includes('function') ? rawTag : 'function';
  }

  return rawTag;
};

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
const isUint8 = v => isInteger(v) && v >= 0 && v <= 255;
const isUint16 = v => isInteger(v) && v >= 0 && v <= 65535;
const isByte = v => isUint8(v); // Alias for clarity
const isInRange = (v, min, max) => isNum(v) && v >= min && v <= max;

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
const isImmutable = v => isPrimitive(v) || (isFrozen(v) && Object.values(v).every(isImmutable));
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

// Coordinate Pairs (GPS or Grid)
const isLatLong = v => isVec2(v) && isInRange(v[0], -90, 90) && isInRange(v[1], -180, 180);

// Spatial Vectors
const isVec2 = v => (isArray(v) || isTypedArray(v)) && v.length === 2;
const isVec3 = v => (isArray(v) || isTypedArray(v)) && v.length === 3;
const isVec4 = v => (isArray(v) || isTypedArray(v)) && v.length === 4;

// Matrices (Standard for WebGL/WebGPU)
const isMat2 = v => isTypedArray(v) && v.length === 4;   // 2x2
const isMat3 = v => isTypedArray(v) && v.length === 9;   // 3x3
const isMat4 = v => isTypedArray(v) && v.length === 16;  // 4x4

// Euler Angles & Quaternions (Rotation)
const isEuler = v => isVec3(v);      // [pitch, yaw, roll]
const isQuaternion = v => isVec4(v); // [x, y, z, w]

// --- Colors ---

// Standard 0-255 Integer Colors (8-bit)
const isRGB = v => isVec3(v) && [].every.call(v, x => isInteger(x) && isInRange(x, 0, 255));
const isRGBA = v => isVec4(v) && [].every.call(v, x => isInteger(x) && isInRange(x, 0, 255));
// Standard 0.0-1.0 Float Colors (Normalized / WebGPU)
const isRGBFloat = v => isVec3(v) && [].every.call(v, x => isNum(x) && isInRange(x, 0, 1));
const isRGBAFloat = v => isVec4(v) && [].every.call(v, x => isNum(x) && isInRange(x, 0, 1));
// HDR Colors (Can exceed 1.0)
const isRGBHDR = v => isVec3(v) && [].every.call(v, x => isNum(x) && x >= 0);
// HSL: [0-360 (Hue), 0-100 (Sat), 0-100 (Light)]
const isHSL = v => isVec3(v) && isWithin(v[0], 0, 360) && isWithin(v[1], 0, 100) && isWithin(v[2], 0, 100);
// HSV/HSB: [0-360, 0-100, 0-100]
const isHSV = v => isHSL(v); 
// LAB Color Space (L: 0-100, A: -128-127, B: -128-127)
const isLAB = v => isVec3(v) && isWithin(v[0], 0, 100) && isWithin(v[1], -128, 127) && isWithin(v[2], -128, 127);
// Hex String (Standard and with Alpha)
const isHexColor = v => isString(v) && /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(v);

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
const isSecureContext = () => typeof window !== 'undefined' && window.isSecureContext === true;
const isNode = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
const isNative = v => isFn(v) && /\{\s*\[native code\]\s*\}/.test(v.toString());

// --- Enforcing types ---

// Usage:
//
// const port = assertType(input, isPositiveInteger, "Port must be a positive integer");
//
const assertType = (v, check, msg = 'Type Assertion Failed') => { if (!check(v)) throw new TypeError(msg); return v; };

// Usage:
//
// matchesSchema(user, { id: isInteger, email: isString });
//
const matchesSchema = (obj, schema) => isObj(obj) && Object.keys(schema).every(key => schema[key](obj[key]));

