function range(count, value = (index) => index) {
  const ary = [];
  for (let i = 0; i <= count; i++) {
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

function uniqDate(data) {
  return data.filter((date, i, self) =>
    self.findIndex(d => d.getTime() === date.getTime()) === i
  );
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

function escapeRegExp(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function wildcardMatch(target, expression) {
  const reg = new RegExp(expression.split('*').map(escapeRegExp).join('.*'));
  return target.match(reg);
}

module.exports = {
  range,
  isDate,
  uniqDate,
  join,
  month,
  cloneDate,
  firstDay,
  nextMonth,
  escapeRegExp,
  wildcardMatch,
};
