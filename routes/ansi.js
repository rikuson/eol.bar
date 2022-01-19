const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../lib/db');
const products = require('../data.json');
const Product = require('../lib/product')
const AnsiGantt = require('../lib/ansi-gantt');
const { uniqDate, cloneDate, firstDay, nextMonth, time } = require('../lib/util');
const { parse } = require('../lib/tokenizer');

router.get('/', async (req, res) => {
  const ua = req.get('User-Agent');
  if (!(new RegExp('^curl\/').test(ua))) {
    res.status(404).end();
    return;
  }
  try {
    const targets = await Promise.all(parse(req.params.products).map(async (target) => {
      const exists = products.includes(target.product);
      return {
        ...target,
        data: exists ? JSON.parse(await db.get(target.product)) : [],
      };
    }));
    const rows = targets.flatMap((target) => {
      const product = new Product(target.data);
      return product.search(target.product, target.operator, target.value);
    });
    const columns = uniqDate(
      rows.flatMap(({ release, support, eol }) => [
        release && firstDay(cloneDate(release)),
        support && firstDay(cloneDate(support)),
        eol && firstDay(nextMonth(cloneDate(eol))),
      ]).filter((d) => d).sort((a, b) => a > b ? 1 : -1)
    );

    const gantt = new AnsiGantt(rows, columns);
    res.send(gantt.render());
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

module.exports = router;
