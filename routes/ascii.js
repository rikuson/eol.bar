const express = require('express');
const router = express.Router({ mergeParams: true });
const products = require('../data/all.json');
const Product = require('../lib/product')
const Ascii = require('../lib/ascii-gantt');
const { uniq, cloneDate, firstDay, nextMonth, time } = require('../lib/util');

router.get('/', (req, res) => {
  const targets = req.params.products
    .split('+')
    .map((p) => new Product(p))
    .filter((p) => products.includes(p.name));
  if (!targets.length) {
    res.status(404).end();
    return;
  }
  const rows = targets.flatMap((target) => {
    target.setData(require(`../data/${target.name}.json`));
    return target.cycles;
  });
  const columns = uniq(
    rows.flatMap(({ release, support, eol }) => [
      release && firstDay(cloneDate(release)).getTime(),
      support && firstDay(cloneDate(support)).getTime(),
      eol && firstDay(nextMonth(cloneDate(eol))).getTime(),
    ]).filter((d) => d).sort((a, b) => a > b ? 1 : -1)
  ).map((t) => new Date(t));

  const ascii = new Ascii(rows, columns);
  res.send(ascii.render());
});

module.exports = router;
