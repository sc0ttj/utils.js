/* ==== Functions for working with **Arrays** ==== */

// cast all strings in arry to numbers
const arrayToNumbers = (arr) => arr.map(Number);

// cast all items in array to boolean
const arrayToBooleans = (arr) => arr.map(Boolean);

// keep only even values
const arrayOfEvenNubers = arr => arr.filter(item => item % 2 === 0);

// keep only odd values
const arrayOfOddNumbers  = arr => arr.filter(item => item % 2 === 1);

// create an array of numbers, counting up to `n`
const arrayOfSize = n => [...Array(n).keys()];

// create an array of numbers, starting from `start`, counting up to `end`
const arrayFromTo = (start, end) => [...Array(end + 1).keys()].slice(start);

// find closest value in given array to `n`   // findClosestValue([3,4,5,8,9], 7) returns 8
const closestValueInArray = (arr, n) => arr.sort((a, b) => Math.abs(a - n) - Math.abs(b - n))[0];

// Given two arrays, returns an array of the values which appear in both
const getArrayIntersections = (arr1, ...arr2) => [...new Set(arr1)].filter((v) => arr2.every((b) => b.includes(v)));

// Combine multiple arrays into one
const combineArrays = (...arrays) => [].concat(...arrays);

// Remove all falsey values from an array
const compactArray = arr => arr.filter(a => a === 0 || !!a);

// shuffles the given array
const shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());

// returns a new shuffled array
const shuffledArray = (arr) => shuffleArray([ ...arr ]);

// sumArray([ 3, 2, 10 ]) returns 15
const sumArray = (arr) => arr.reduce((a, b) => a + b, 0);

// [ 1, 2, 3, 4 ] returns 24   // it performs (((1*2)*3)*4), which is 24
const getProductOfArray = arr => arr.reduce((a, b) => a * b);

// Merge but don't remove the duplications
const mergeArrays = (a, b) => a.concat(b);

// Merge and remove the duplications (union)
const unionArrays = (a, b) => [...new Set(a.concat(b))];

// array values accumulator.. given [1,2,3], it returns [1,3,6]
const accumulateArrayValues = (arr) => arr.reduce((a, b, i) => (i === 0 ? [b] : [...a, b + a[i - 1]]), [0]);

// getOccurrencesOfValue([1,2,3,3,4], 3) // returns 2
const getOccurrencesOfValue = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

// get the index of the highest value in the given array
const indexOfMax = (arr) => arr.reduce((prev, curr, i, a) => (curr > a[prev] ? i : prev), 0);

// get the index of the lowest value in the given array
const indexOfMin = (arr) => arr.reduce((prev, curr, i, a) => (curr < a[prev] ? i : prev), 0);

// returns the highest value in an array
const highestValueFromArray = arr => Math.max(...arr);

// returns the lowest value in an array
const lowestValueFromArray = arr => Math.min(...arr);

// remove the item at the given index from the given array
const removeArrayItem = (arr, i) => [...arr.slice(0, i), ...arr.slice(i + 1)]

// returns a new array without the duplicate entries of the input array
const arrayWithoutDuplicates = (arr) => [...new Set(arr)];

// given (['x', 'y'], [1, 2]);  // [['x', 1], ['x', 2], ['y', 1], ['y', 2]]
const arraysToCartesianProduct = (a, b) => a.reduce((p, x) => [...p, ...b.map(y => [x, y])], []);

// swap the rows and columns of a matrix (a 2d array), example:
//    transposeMatrix([
//      [1, 2, 3], //  [1, 4, 7],
//      [4, 5, 6], //  [2, 5, 8],
//      [7, 8, 9], //  [3, 6, 9],
//    ]);
const transposeMatrix = (matrix) => matrix[0].map((col, i) => matrix.map((row) => row[i]));

// unzip([ ['a', 1], ['b', 2], ['c', 3] ]);  //  returns [['a', 'b', 'c'], [1, 2, 3]]
const unzipArray = (arr) => arr.reduce((acc, c) => (c.forEach((v, i) => acc[i].push(v)), acc), Array.from({ length: Math.max(...arr.map((a) => a.length)) }, (_) => []));

// zipArray(['a', 'b', 'c'], [1, 2, 3]);   // returns [['a', 1], ['b', 2], ['c', 3]]
const zipArray = (...arr) => Array.from({ length: Math.max(...arr.map((a) => a.length)) }, (_, i) => arr.map((a) => a[i]));

// return new array without the given values
const arrayWithout = (arr, ...values) => arr.filter(el => !values.some(exclude => el === exclude));






/* ==== Functions for working with **Arrays of Objects** ==== */

// Converts an array of objects into an array of objects containing key/value pairs
const toKeyValuePairs = array => array.map(obj => objToKeyValuePairs(obj));

// Given an array of objects, returns an object "keyed" by the given `prop` value
const toKeyedObject = (array, key, obj = {}) => { array.forEach(item => obj[item[key]] = item); return obj; };

// alternative to the above:
// converts array of objects to an indexed object, where `prop` is the key
const toObjIndexedByProp = (arr, key) => arr.reduce((acc, it) => (acc[it[key]] = it, acc), {});

// converts array of objects (with `id` prop) to an index object, where id is the key
const toIndexedObj = arr => arr.reduce((acc, it) => (acc[it.id] = it, acc), {});

// count the number of times a given object prop occurs, in an arry of objects
const countByKey = (arr, key) => arr.reduce((prev, curr) => ((prev[curr[key]] = ++prev[curr[key]] || 1), prev), {});

// get all values of the given object property, in an array of objects
const getValuesByKey = (arr, key) => arr.map((obj) => obj[key]);

// return the lowest value of the given key
const getMinValueOfKey = (arr, key) => arr.reduce((a, b) => (a[key] < b[key] ? a : b), {});

// return the highest value of the given key
const getMaxValueOfKey = (arr, key) => arr.reduce((a, b) => (a[key] >= b[key] ? a : b), {});

// Get average value of the given prop in an array of objects
// ([ {f:10}, {f:5} ], 'f')  // returns 7.5
const getAverageOfKey = (arr, key) => arr.map(obj => obj[key]).reduce((acc, val) => acc + val, 0) / arr.length;

// Get the combined total value of the given object property, in an array of objects,
// note that each object in the array must contain the given property (`key`)
const getSumTotalOfKey = (array, key) => array.reduce((prev, cur) => prev + cur[key], 0);

// Get the object from `array` that has the lowest or highest value for `key`
const getObjectWithMinOrMaxValue = (array, key, which) => array.reduce((max, obj) => which === 'min' ? max[key]<obj[key]?max:obj : max[key]>obj[key]?max:obj);
const getObjectWithMinValue = (array, key) => getObjectWithMinOrMaxValue(array, key, 'min');
const getObjectWithMaxValue = (array, key) => getObjectWithMinOrMaxValue(array, key, 'max');

// group values by the given function, in an array or array of objects
// example: groupBy([1, 2, 3, 4], v => (v % 2 ? "odd" : "even"));  // { odd: [1, 3], even: [2, 4] };
const groupByFn = (array,f)=>array.reduce((a,b,i)=>((a[f(b,i,array)]||=[]).push(b),a),{});

// Sort an array of objects by the given object `prop` - returns an array,
const sortByKey = (array, key, order = 'asc') => [...array].sort((a, b) => order === 'asc' ? a[key]-b[key] : b[key]-a[key]);
const sortByKeyAsc = (array, key) => sortByKey(array, key, 'asc');
const sortByKeyDesc = (array, key) => sortByKey(array, key, 'desc');


