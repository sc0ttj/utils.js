//
// Sorting functions
//

const numbersAsc = (a, b) => a - b;
const numbersDesc = (a, b) => b - a;
// Safer string sorting
const stringsAsc = (a, b) => a.localeCompare(b);
const stringsDesc = (a, b) => b.localeCompare(a);
const datesAsc = (a, b) => a.getTime() - b.getTime();  // least recent at top
const datesDesc = (a, b) => b.getTime() - a.getTime(); // most recent at top 

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * Time complexity: O(n)
 */
const shuffled = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};
const randomized = shuffled;

const ascending = (a, b) => {
  if (typeof a === 'string' && typeof b === 'string') return stringsAsc(a, b);
  if (a instanceof Date && b instanceof Date) return a - b;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return 0; // Default case for safety
};

const descending = (a, b) => {
  if (typeof a === 'string' && typeof b === 'string') return stringsDesc(a, b);
  if (a instanceof Date && b instanceof Date) return datesDesc(a, b);
  if (typeof a === 'number' && typeof b === 'number') return numbersDesc(a, b);
  return 0; // Default case for safety
};

// Sort strings according to the rules of the users current system locale.
// Useful for local-aware sorting of non-English and non-latin, or UTF-8 strings. 
// For available options, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#options
// Intl sorting with fallback for Node.js
const stringsIntl = (a, b, opts = {}) => 
  a.localeCompare(b, typeof navigator !== 'undefined' ? navigator.languages[0] : undefined, opts);

//
// Simple functions to create custom sort methods
//

// Return a sort function that sorts by the given property.
// Handles strings, numbers and dates.
//
// Usage:
//  const mostRecent = sortBy('date', 'desc');
//  const sortedData = array.sort(mostRecent);
const sortBy = (prop, order) => 
  (a, b) => (order === 'desc') ? descending(a[prop], b[prop]) : ascending(a[prop], b[prop]);

// Returns a sort function that applies multiple sort functions, in the given order.
//
// Usage:
//   const byDate = sortBy('date', 'desc');
//   const byName = sortBy('name');
//   const byDateThenName = sortOrder(byDate, byName);
//   const sortedData = array.sort(byDateThenName);
const sortOrder = (...sortFuncs) => 
  (a, b) => {
    for (const sort of sortFuncs) {
      let res = sort(a, b);
      if (res !== 0) return res;  // items not equal (in sorting terms) so no more criteria to apply
    }
    return 0; 
  };
