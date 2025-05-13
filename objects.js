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
validationErrors = (obj, schema) => {
  var errs = []

  Object.entries(schema).sort().forEach(item => {
    var key = item[0]
    var val = obj[key]

    var keyType = typeof obj[key]
    var expectedType = schema[key]

    if (expectedType === "array") {
      if (!Array.isArray(val)) {
        errs.push({ key: key, expected: "array", got: keyType })
      }
    }

    // if we have object, call validator on it
    else if (keyType === "object" && !Array.isArray(val)) {
      errs = [...errs, ...validator(obj[key], schema[key])]
    }

    // if we have a function, it's a custom validator func, should return true/false
    else if (typeof expectedType === "function") {
      if (!schema[key](val)) {
        errs.push({ key: key, expected: true, got: false })
      }
    }

    // if we have a string, it should be the name of the expected type in the schema
    else if (keyType !== expectedType.toLowerCase()) {
      errs.push({ key: key, expected: schema[key], got: keyType })
    }
  })
  return errs
}

// Create a "safe" object, that is protected against prototype pollution,
// sorted in a stable way, sealed by default (no new props can be added), 
// and that can optionally validate any changes to itself against its given 
// schema - changes are only allowed to the object if valid, according to 
// the schema.
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
  // create an object to return, with a null prototype, and also prevent
  // any changes to its prototype and constructor.
  let obj = Object.create(null);
  // hidden holder of the vars
  const props = Object.create(null);
  if (typeof schema !== 'object') {
    // no valid schema was provided, so just add stuff from `data` into `obj`
    obj = { ...data };
    if (frozen) {
        Object.freeze(obj.prototype);
        Object.freeze(obj.__proto__);
        Object.freeze(obj.constructor);
    }
    return obj;
  }
  else if (typeof schema === 'object') {
    // for each property in the schema
    Object.keys(schema).sort().forEach(key => {
      let v = data[key];
      if (isObj(v)) {
          v = safeObject(v, schema[key], sealed, frozen);
      }
      // stable sorting of properties
      delete props[key];
      props[key] = v;
      // 1. Whenever `obj[key]` changes, re-run a built-in validator that checks
      //    the value against what is expected in `schema[key]`.
      // 2. Only update `obj` if the new property or value is valid, according to
      //    `schema`, else, throw an error.
      Object.defineProperty(obj, key, {
          enumerable: true,
          configurable: false,
          get() {
            return props[key];
          },
          set(val) {
            // let's validate `value` against its entry in the schema.
            const errs = validationErrors({ [key]: val }, { [key]: schema[key] });
            if (errs.length > 0) {
              const errMsg = errs.map(({ key, expected, got}) => {
                // List the schemas validator function name, or print the function itself if it's unnamed
                const expectedType = typeof schema[key] === 'function'
                  ? (schema[key].name === key ? '' + schema[key] : schema[key].name)
                  : schema[key];
                return `Error: property \`${key}\` expected ${expectedType}, but got ${val}.`;
              }).join('\n');
              throw Error(`Validation failed!\n\n ${errMsg}.\n`);
            }
            // we passed validation OK, so try to set the prop
            props[key] = val;
          },
        });
    });
  }

  // "Seal" the object
  // Attempting to add or delete properties to a "sealed" object, or to convert a data property
  // to an accessor (getter/setter), or vice versa, will fail.
  // The values of sealed "data properties" (regular properties) can still be changed as normal.
  if (sealed === true) Object.seal(obj);

  // "Freeze" the object
  // Prevent extensions (new properties), deletions, and make existing properties non-writable and
  // non-configurable. More simply - a frozen object cannot be changed at all.
  if (frozen === true) Object.freeze(obj);

  return obj;
};


function deepClone(obj) {
	if(Array.isArray(obj)){
		const temp = [];
		for (let i = 0; i < obj.length; i++) {
			temp.push(deepClone(obj[i]));
		}
		return temp;
	}
	if(typeof(obj) === "object" && obj !== null){
		const temp = {};
		for (let key in obj) {
		  if (obj.hasOwnProperty(key)) {
			temp[key] = deepClone(obj[key]);
		  }
		}
		return temp;
	}
	return obj;
}


