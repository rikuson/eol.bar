function range(start, end, value = (index) => index) {
  const ary = [];
  for (let i = start; i < end; i++) {
    if (typeof value === 'function') {
      ary.push(value(i));
    } else {
      ary.push(value);
    }
  }
  return ary;
}

function isDate(val) {
  return val instanceof Date;
}

function uniq(data) {
  return Array.from(new Set(data));
}

function join(ary, callback = (val) => val) {
  return ary.map(callback).join('');
}

function month(i) {
  return [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][i];
}

function cloneDate(date) {
  return new Date(date.getTime());
}

function firstDay(date) {
  date.setDate(1);
  return date;
}

function nextMonth(date) {
  date.setMonth(date.getMonth() + 1);
  return date;
}

module.exports = {
  range,
  isDate,
  uniq,
  join,
  month,
  cloneDate,
  firstDay,
  nextMonth,
};
