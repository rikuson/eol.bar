const express = require('express');
const router = express.Router({ mergeParams: true });
const products = require('../data/all.json');
const Product = require('../lib/product')
const AnsiGantt = require('../lib/ansi-gantt');
const { uniqDate, cloneDate, firstDay, nextMonth, time } = require('../lib/util');
const { parse } = require('../lib/tokenizer');

router.get('/', (req, res) => {
  const targets = parse(req.params.products)
    .filter(({ product }) => products.includes(product));
  if (!targets.length) {
    res.status(404).end();
    return;
  }
  const rows = targets.flatMap((target) => {
    const product = new Product(require(`../data/${target.product}.json`));
    return product.search(target.product, target.operator, target.value);
  });
  if (!rows.length) {
    res.status(404).end();
    return;
  }
  const columns = uniqDate(
    rows.flatMap(({ release, support, eol }) => [
      release && firstDay(cloneDate(release)),
      support && firstDay(cloneDate(support)),
      eol && firstDay(nextMonth(cloneDate(eol))),
    ]).filter((d) => d).sort((a, b) => a > b ? 1 : -1)
  );

  const gantt = new AnsiGantt(rows, columns);
  res.send(gantt.render());
});

module.exports = router;
