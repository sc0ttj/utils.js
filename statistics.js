//
// Functions for statistics
//

// This file heavily borrows, begs and steals from https://github.com/simple-statistics/


// get the min and max values of the given array
const extent = arr => [ Math.min(...arr), Math.min(...arr) ];

// get the difference between the min and max values 
const range = arr => Math.max(...arr) - Math.min(...arr); 

// get the difference between the min and max values - always returns a positive number
const difference = arr => Math.abs(range(arr)); 

// a "proper random" shuffle
const shuffleArray = arr => arr.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1]);

// the "Fisher Yates" shuffle algorithm (https://en.wikipedia.org/wiki/Fisher-Yates_shuffle)
const shuffleArrayFisherYates = (arr) => {
  let n = arr.length;
  while (--n) {
    let k = Math.floor(Math.random() * n);  // 0 <= k <= n (!)
    let temp = arr[n];
    arr[n] = arr[k];
    arr[k] = temp;
  }
  return arr;
}

// get the relative error from an expected number, and the actual value
const relativeError = (actual, expected) => {
    if (actual === 0 && expected === 0) return 0;
    return Math.abs((actual - expected) / expected);
}

// returns a random sample
const sample = (arr, num) => shuffleArrayFisherYates([...arr]).slice(0, num);

// sum([ 3, 2, 10 ]) returns 15
const sum = arr => arr.reduce((a, b) => a + b, 0);

// get the mean average of an array of number values
const mean = arr => sum(arr) / arr.length;

// Get the "Median" value of an array - same as quantile(arr, 0.5)
// The middle number; found by ordering all data points and picking out the 
// one in the middle (or if there are two middle numbers, taking the mean 
// of those two numbers).
const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

// Get the "Mode" value of an array
// The "mode" is simply the number that occurs the highest number of times.
const mode = arr => [...arr].sort((a,b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop();

// get value as a percentage of total
const percentage = (value, total) => (value === 0 && total === 0) ? 0 : (100 * value) / total;

// weightedAverage([1, 2, 3], [0.6, 0.2, 0.3]); // 1.72727
const weightedAverage = (arr, weights) => {
  const [sum, weightSum] = weights.reduce(
    (acc, w, i) => {
      acc[0] += arr[i] * w;
      acc[1] += w;
      return acc;
    },
    [0, 0]
  );
  return sum / weightSum;
};

// for each value in the given array, get the deviation from the given mean average
const deviations = (arr, mean) => arr.map((num, mean) => num - mean);

// squares an array of mean deviation values (helper function for variance())
const squaredDeviations = (arr) => arr.map(num => Math.pow(num, 2));

// Get the "variance"
// The variance measures variability from the average or mean. 
// It is a measure of how far a set of numbers is spread out from their mean average.
// Variance is the average squared deviations from the mean, while "standard deviation" is the square root of the variance.
// For samples of a "population", use sample = true to apply "Bessels Correction".
const variance = (arr, sample) => squaredDeviations(deviations(arr, mean(arr))).reduce(sum) /  (arr.length - (sample ? 1 : 0));

// If sample is truthy, we apply Bessel's Correction. Why? 
// Standard deviation is only appropriate if used on a whole "population".
// For samples of a "population", use sample = true to apply "Bessels Correction".
const standardDeviation = (arr, sample) => Math.sqrt(variance(arr)) - (sample ? 1 : 0);

// Get the "covariance" between two properties.
// "Covariance" is how much, and to what extent, two variables change **together**.
// - Positive covariance: indicates two variables tend to move in the same direction.
// - Negative covariance: indicates two variables tend to move in inverse directions.
//
// "Covariance" measures the total variation of two random variables from their expected 
// values. It can only measure the direction the variables move - same way or opposite, 
// it does not indicate the **strength** - for that we need the "Correlaton".
//
// Note: arr1 and arr2 must have the same length, which must be more than 1.
const sampleCovariance = (arr1, arr2) => {
    const mean1 = mean(arr1);
    const mean2 = mean(arr2);
    let sum = 0;

    // sum the variance from the mean.
    for (let i = 0; i < arr1.length; i++) {
        sum += (arr1[i] - mean1) * (arr2[i] - mean2);
    }
    // this is Bessels' Correction: an adjustment made to "samples" of datasets
    const besselsCorrection = arr1.length - 1;

    // the covariance is weighted by the length of the datasets.
    return sum / besselsCorrection;
}

// Get a measure of how correlated two datasets are, between -1 and 1.
// "Correlation" measures the strength of the relationship between variables and is
// the scaled measure of covariance, it has no units.
function sampleCorrelation(arr1, arr2) {
    const cov = sampleCovariance(arr1, arr2);
    const xstd = sampleStandardDeviation(arr1);
    const ystd = sampleStandardDeviation(arr2);

    return cov / xstd / ystd;
}


// Get `z-score`` and `p-value``
//
// These are used to find statistically significant clustering or dispersion.
// 
// The `p-value` is the probability that the observed spatial pattern was created by 
// some random process. 
// 
// When the p-value is very small, it means it is very unlikely (small probability)  
// that the observed spatial pattern is the result of random processes.
//
// Small p-values and either a very high or a very low z-score, this indicates a  
// non-random, statistically significant dataset.
//
// When the absolute value of the z-score is large and the probabilities are small you 
// are seeing something unusual and generally very interesting - unlikely, 
// statistically significant, non-random data.

// the number of standard deviations from the mean
const zScore = (num, mean, stdDev) => (num - mean) / stdDev;

// get the z-score of each number in an array
const zScores = (arr) => {
  const mean = mean(arr);
  const sd = standardDeviation(arr);
  return arr.map(num => (num - mean) / sd);
}

// Convert "z-score" to probability (known as "p-value").
// The p-value is the probability something is due to random processes.
// It helps determine if something is statistically significant or not.
const zScoreToPvalue = (z) => {
    // z = the number of standard deviations from the mean.
    // If z is greater than 6.5 standard deviations from the mean the number
    // of significant digits will be outside of a reasonable range.
    if ( z < -6.5) return 0.0;
    if ( z > +6.5) return 1.0;

    let factK = term = 1, 
        pvalue = k = 0,
        loopStop = Math.exp(-23);

    while(Math.abs(term) > loopStop) {
      term = 0.3989422804 * Math.pow(-1,k) * Math.pow(z,k) / (2 * k + 1) / Math.pow(2,k) * Math.pow(z,k+1) / factK;
      pvalue += term;
      k++;
      factK *= k;
    }
    pvalue += 0.5;

    return pvalue;
}

// Convert probability (p-value) to z-score (the number of standard deviations from the mean).
// This does the opposite of zScoreToPvalue() 
const  pvalueToZscore = (p) => {
    if (p < 0.5) return -percentile_z(1 - p);

    if (p > 0.92) {
        if (p == 1) return Infinity;
        let r = Math.sqrt(-Math.log(1 - p));
        return (((2.3212128*r+4.8501413)*r-2.2979648)*r-2.7871893)/
               ((1.6370678*r+3.5438892)*r+1);
    }
    p -= 0.5;
    let r = p*p;
    return p*(((-25.4410605*r+41.3911977)*r-18.6150006)*r+2.5066282)/
             ((((3.1308291*r-21.0622410)*r+23.0833674)*r-8.4735109)*r+1);
}

// also generate the related lookup tables
// https://github.com/simple-statistics/simple-statistics/blob/main/src/standard_normal_table.js


// Percentiles & Quartiles
//
//   Percentiles go from 0 to 100. 
//   Quartiles go from 1 to 4 (or 0 to 4). 
//   Quintiles go from 1 to 5 (or 0 to 5). 
//   Quantiles can go from anything to anything

// Get the "percentile" - the percentage of values below the given value
// - it's useful for seeing what % of the data "scored lower" than the given value
const percentile = (arr, val) => {
  let count = 0;
  arr.forEach(v => {
    if (v < val) {
      count++;
    } else if (v === val) {
      count += 0.5;
    }
  });
  return 100 * count / arr.length;
}

// usage:  quantile([10,20], .5)
const quantile = (arr, q) => {
    const sorted = arr.sort((a, b) => a - b); // sort ascending
    let pos = (sorted.length - 1) * q;

    if (pos % 1 === 0) {
        return sorted[pos];
    }
    pos = Math.floor(pos);
    if (sorted[pos + 1] !== undefined) {
        return (sorted[pos] + sorted[pos + 1]) / 2;
    }
    
    return sorted[pos];
};

// quartiles
const quartile25 = arr => quantile(arr, 0.25);
const quartile50 = arr => quantile(arr, 0.50);
const quartile75 = arr => quantile(arr, 0.75);

// the difference between the third quartile and first quartile
const interQuartileRange = arr => quantile(arr, 0.75) - quantile(arr, 0.25);


// get a uniformly distributed random integer
function randi(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
}

// get a uniformly distributed random number
function randf(min, max) {
  return Math.random()*(max-min) + min;
}

// Normal distribution random number:
// A random variable with a Gaussian distribution is said to be normally distributed, 
// and is called a normal deviate. 
// Normal distributions are important in statistics and are often used in the natural 
// and social sciences to represent real-valued random variables whose distributions 
// are not known.
const randn = (mean, variance) => {
  var V1, V2, S;
  do {
    var U1 = Math.random();
    var U2 = Math.random();
    V1 = 2 * U1 - 1;
    V2 = 2 * U2 - 1;
    S = V1 * V1 + V2 * V2;
  } while (S > 1);
  X = Math.sqrt(-2 * Math.log(S) / S) * V1;
  X = mean + Math.sqrt(variance) * X;
  return X;
}

// "cartesian product" or "cross product"
// get all permutations of applying values in array2 to values in array1 
// given (['x', 'y'], [1, 2]);  // [['x', 1], ['x', 2], ['y', 1], ['y', 2]]
const cartesianProduct = (a, b) => a.reduce((p, x) => [...p, ...b.map(y => [x, y])], []);

// create a 2d matrix
const newMatrix = (columns, rows) => {
  const matrix = [];
  for (let i = 0; i < columns; i++) {
    const column = [];
    for (let j = 0; j < rows; j++) {
      column.push(0);
    }
    matrix.push(column);
  }
  return matrix;
}

// swap the rows and columns of a matrix, example:
//    transposeMatrix([
//      [1, 2, 3], //  [1, 4, 7],
//      [4, 5, 6], //  [2, 5, 8],
//      [7, 8, 9], //  [3, 6, 9],
//    ]);
const transposeMatrix = (matrix) => matrix[0].map((col, i) => matrix.map((row) => row[i]));

// K-means clustering
// https://github.com/simple-statistics/simple-statistics/blob/main/src/k_means_cluster.js

// Linear regression lines
// https://github.com/simple-statistics/simple-statistics/blob/main/src/linear_regression.js

// Spatial Autocorrelation (Global Moran's I)
// https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-statistics/h-how-spatial-autocorrelation-moran-s-i-spatial-st.htm
