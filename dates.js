//
//
// Functions for working with Dates:
//
//

const isDate = v => isFn(v.getDay);

const isDateValid = (...val) => !Number.isNaN(+new Date(...val));

const isDateRange  = r => isDate(r[0]) && isDate(r[1]);

// isWeekday(new Date(2021, 0, 11));
const isWeekday = (date) => date.getDay() % 6 !== 0;

const isWeekend = (date) => date.getDay() % 6 == 0;

const compareDates = (a, b) => a.getTime() > b.getTime();

const getDateRange = r => (new Date(r[0])-new Date(r[1]))/864e5|0;

const getDayOfYear = (date) => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

const getPastWeek = () => [...Array(7).keys()].map(days => new Date(Date.now() - 86400000 * days))

const getDayDiff = (date1, date2) => Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / 86400000);

const getMonthDiff = (startDate, endDate) => Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 - startDate.getMonth() + endDate.getMonth());

const getTimeFromDate = date => date.toTimeString().slice(0, 8);

const toYYYYMMDD = (date) => date.toISOString().slice(0, 10);

const secondsToHms = (seconds) => {
   const date = new Date(null);
   date.setSeconds(seconds);
   return date.toISOString().substr(11, 8);
}

// get most recent date from an array of dates
const mostRecentDate = dates => dates.reduce((max, d) => d > max ? d : max, dates[0]);
