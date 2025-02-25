//
// Sorting functions
//

const numbersAsc = (a, b) => a - b;
const numbersDesc = (a, b) => b - a;
const stringsAsc = (a, b) => a > b ? 1 : -1;
const stringsDesc = (a, b) => b > a ? 1 : -1;
const datesAsc = (a, b) => a.getTime() < b.getTime();  // least recent at top
const datesDesc = (a, b) => a.getTime() > b.getTime(); // most recent at top 

const randomised = () => Math.random() - 0.5;
const randomized = randomised;

const ascending = (a,b) => {
  if (typeof a === 'string' && typeof b === 'string') return stringsAsc(a,b);
  else if (typeof a === 'date' && typeof b === 'date') return datesAsc(a,b);
  else return numbersAsc(a,b);
};

const descending = (a,b) => {
  if (typeof a === 'string' && typeof b === 'string') return stringsDesc(a,b);
  else if (typeof a === 'date' && typeof b === 'date') return datesDesc(a,b);
  else return numbersDesc(a,b);
};

// Sort strings according to the rules of the users current system locale.
// Useful for local-aware sorting of non-English and non-latin, or UTF-8 strings. 
const stringsIntl = (a,b, opts = {}) => a.localeCompare(b, navigator.languages[0], opts);

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
  (a, b) => (order === 'desc') ? descending(a[prop],b[prop]) : ascending(a[prop],b[prop]);

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
      if (res !== 0) return res; // items not equal (in sorting terms) so no more criteria to apply
    }
    return res;
  };
