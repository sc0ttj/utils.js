// NOTE:
// ----------------------------------------------------------------------------
//
// ** When a key/value structure is needed, Map should be preferred to Object. **
//
//   It’s possible to create Objects in JavaScript that don’t have a prototype.
//   It requires the usage of Object.create(). Objects created through this
//   API won’t have the __proto__ and constructor attributes.

// "Prototype pollution" attacks
// Creating Objects in this way can help prevent "prototype pollution" attacks:

    const obj = Object.create(null);
    obj.__proto__ // undefined
    obj.constructor // undefined

// Using Object.freeze() can help further prevent "prototype pollution" attacks:

    Object.freeze(Object.prototype);
    Object.freeze(Object);

// You can then test if the freezing above worked, like so:

    ({}).__proto__.test = 123;
    ({}).test // remains undefined


// The Object.seal() method is similar, but still allows changing the values
// of existing properties. Use it on your own Objects after adding the desired
// or required properties.

    const myObj = { foo: 0 }; // has all the properties we need now..
    Object.seal(myObj);       // so seal it

// ----------------------------------------------------------------------------

//
// Functions for working with Objects
//


// usage:
// mapKeys({ foo: 2, bar: 3 }, k => `prefix_${k}`)
// returns { prefix_foo: 2, prefix_bar: 3 }
function mapKeys(obj, fn) {
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    newObj[fn(key)] = value;
  }
  return newObj;
}


// usage:
// mapValues({ a: 2, b: 3 }, x => x**2)
// returns { a: 4, b: 9 }
function mapValues(obj, fn) {
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    newObj[key] = fn(value);
  }
  return newObj;
}

// clone the given object, return the cloned object
const cloneObj = obj => typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

// return a new object, based on obj, but with defaults added in
const applyDefaults = (obj, defaults) => ({ ...defaults, ...obj });


// A (somewhat) more reliable type checking (see more in types.js)
const type = v => Array.isArray(v) ? 'array' : Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

const isObj = v => type(v) === 'object';

// Validate the given object against the given schema.
// Returns an array of errors if the object fails validation.
//
// Usage:
//
//    const obj = {
//      name: 'bob',
//      age:  20,
//      list: [1, 2, 3],
//    };
//    const schema = {
//      name: 'string',                                         // expect typeof === 'string'
//      age:  val => typeof val === 'number' && val > 17,       // expect n is a number over 17
//      list: arr => arr.every(val => typeof val === 'number'), // expect array containing numbers only
//    };
//    const errs = validationErrors(obj, schema);               // errs.length === 0
//
const validationErrors = (obj, schema) => {
  let errs = [];
  if (!schema) return errs;

  Object.entries(schema).forEach(([key, expectedType]) => {
    const val = obj[key];
    const actualType = type(val);

    // 1. Custom Validator Function
    if (typeof expectedType === "function") {
      if (!expectedType(val)) {
        errs.push({ key, expected: "custom validation", got: val });
      }
    }
    // 2. Nested Object Validation
    else if (isObj(expectedType)) {
      if (!isObj(val)) {
        errs.push({ key, expected: "object", got: actualType });
      } else {
        // Recursively collect errors
        errs = [...errs, ...validationErrors(val, expectedType)];
      }
    }
    // 3. Array Type String
    else if (expectedType === "array") {
      if (actualType !== "array") {
        errs.push({ key, expected: "array", got: actualType });
      }
    }
    // 4. Primitive Type String (string, number, boolean)
    else if (typeof expectedType === "string") {
      if (actualType !== expectedType.toLowerCase()) {
        errs.push({ key, expected: expectedType, got: actualType });
      }
    }
  });
  return errs;
};

const freezeObject = o => {
  if (o.prototype) Object.freeze(o.prototype);
  if (o.__proto__) Object.freeze(o.__proto__);
  Object.freeze(o);
};

const getErrorMsg = (key, val, schemaProp) => {
  const errs = validationErrors({ [key]: val }, { [key]: schemaProp });
  if (errs.length > 0) {
    return errs.map(({ key, expected, got }) => {
      let expectedDesc = typeof schemaProp === 'function' 
        ? (schemaProp.name || 'custom function') 
        : JSON.stringify(schemaProp);
      return `Property \`${key}\` expected ${expectedDesc}, but got ${JSON.stringify(val)}`;
    }).join('\n');
  }
  return null;
};

// Create a "type safe" object, that is protected against prototype pollution,
// sealed by default (no new props can be added), and that can optionally
// validate any changes to itself against its given schema - changes are
// only allowed to the object if valid, according to the schema.
//
// Usage:
//
// const obj = { name: 'bob', age: 20 };
// const schema = {
//   name: 'string',
//   age: val => typeof val === 'number' && val > 17,
// };
// const myObj = safeObject(obj, schema);
//
// myObj.age = 'foo'; // throws Error - wrong type according to the schema.
// myObj.baz = 'foo'; // throws Error - the property 'baz' is unknown to the schema.
//
const safeObject = (data = {}, schema = undefined, sealed = true, frozen = false) => {
  // Use null prototype to prevent pollution
  const obj = Object.create(null);
  const props = Object.create(null);

  if (!isObj(schema)) {
    Object.keys(data).forEach(key => obj[key] = data[key]);
    if (frozen) freezeObject(obj);
    return obj;
  }

  Object.keys(schema).forEach(key => {
    let v = data[key];
    
    // Initial Validation
    const errMsg = getErrorMsg(key, v, schema[key]);
    if (errMsg) throw Error(`Validation failed!\n${errMsg}`);

    // Recursive Protection
    if (isObj(v) && isObj(schema[key])) {
      v = safeObject(v, schema[key], sealed, frozen);
    }

    props[key] = v;

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true, // Must be true to allow Seal/Freeze later
      get() { return props[key]; },
      set(newVal) {
        const error = getErrorMsg(key, newVal, schema[key]);
        if (error) throw Error(`Validation failed!\n${error}`);
        
        // If setting a new object, wrap it
        if (isObj(newVal) && isObj(schema[key])) {
          props[key] = safeObject(newVal, schema[key], sealed, frozen);
        } else {
          props[key] = newVal;
        }
      },
    });
  });

  if (sealed) Object.seal(obj);
  if (frozen) freezeObject(obj);

  return obj;
};



/**
 * mergeObject - Multi-object deep merge with circular reference safety.
 * 
 * Usage: 
 * 
 *    const myObj = mergeObj(obj1, obj2, obj3, ...);
 * 
 */
function mergeObject(...sources) {
  const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val);
  
  if (sources.length === 0) return {};
  if (sources.length === 1) return isObject(sources[0]) ? { ...sources[0] } : sources[0];

  // Initialize target with a shallow clone of the first object to prevent original mutation
  const target = isObject(sources[0]) ? { ...sources[0] } : {};
  const remaining = sources.slice(1);
  const seen = new WeakMap();

  for (const source of remaining) {
    if (!isObject(source)) continue;

    // Iterative stack avoids recursion depth limits
    const stack = [{ t: target, s: source }];

    while (stack.length > 0) {
      const { t, s } = stack.pop();

      // Handle circular references using WeakMap for memory efficiency
      if (seen.has(s)) {
        // Option 1: Just skip (standard for fast merging)
        // Option 2: Link existing (t[key] = seen.get(s)), used if you need to keep structure
        continue;
      }
      seen.set(s, t);

      for (const key in s) {
        if (Object.prototype.hasOwnProperty.call(s, key)) {
          const sVal = s[key];
          const tVal = t[key];

          if (isObject(sVal)) {
            // Target key missing or not an object? Initialize it.
            if (!isObject(tVal)) {
              t[key] = { ...sVal };
            } else {
              // Both are objects: merge them. Clone t[key] to prevent mutation of the original.
              t[key] = { ...tVal };
              stack.push({ t: t[key], s: sVal });
            }
          } else if (Array.isArray(sVal)) {
            // Standard performance-first array strategy: Concatenation
            t[key] = Array.isArray(tVal) ? tVal.concat(sVal) : [...sVal];
          } else if (sVal instanceof Date) {
            t[key] = new Date(sVal.getTime());
          } else if (sVal instanceof RegExp) {
            t[key] = new RegExp(sVal);
          } else {
            // Primitive overwrite
            t[key] = sVal;
          }
        }
      }
    }
  }

  return target;
}

/**
 * If `structuredClone` is not available:
 * 
 * A fast, iterative deep clone that handles circular references.
 * Safe from stack overflows (unlike recursive functions).
 */
function cloneObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  // Handle special built-in types
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);

  const seen = new WeakMap();

  function clone(val) {
    if (val === null || typeof val !== 'object') return val;
    if (seen.has(val)) return seen.get(val);

    const result = Array.isArray(val) ? [] : {};
    seen.set(val, result);

    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        result[key] = clone(val[key]);
      }
    }
    return result;
  }

  return clone(obj);
};

