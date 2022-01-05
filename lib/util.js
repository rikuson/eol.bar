function range(start, end) {
  const ary = [];
  for (let i = start; i < end; i++) {
    ary.push(i);
  }
  return ary;
}

function isDate(val) {
  return val instanceof Date;
}

function uniq(data) {
  return Array.from(new Set(data));
}

function join(ary, callback) {
  return ary.map(callback).join('');
}

module.exports = {
  range,
  isDate,
  uniq,
  join,
};
