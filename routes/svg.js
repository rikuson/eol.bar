const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../lib/db');
const products = require('../data.json');
const Product = require('../lib/product')
const Gantt = require('../lib/svg-gantt');
const Alert = require('../lib/svg-alert');
const { uniqDate, cloneDate, firstDay, nextMonth, time } = require('../lib/util');
const { parse } = require('../lib/tokenizer');
const SyntaxError = require('../lib/syntax-error');

router.get('/', async (req, res) => {
  try {
    const targets = (await Promise.all(parse(req.params.products).map(async (target) => {
      const exists = products.includes(target.product);
      if (!exists) {
        throw new NotFoundError(target.product);
      }
      return {
        ...target,
        data: JSON.parse(await db.get(target.product)),
      };
    })));
    const rows = targets.flatMap((target) => {
      const product = new Product(target.data);
      return product.search(target.product, target.operator, target.value);
    });
    const columns = uniqDate(
      rows.flatMap(({ releaseDate, support, eol }) => [
        releaseDate && firstDay(cloneDate(releaseDate)),
        support && firstDay(cloneDate(support)),
        eol && firstDay(nextMonth(cloneDate(eol))),
      ]).filter((d) => d).sort((a, b) => a > b ? 1 : -1)
    );

    const gantt = new Gantt(rows, columns);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(gantt.render(req.query.from, req.query.to));
  } catch (err) {
    if (err instanceof SyntaxError) {
      const alt = new Alert(err);
      res.status(500);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(alt.render());
      return;
    }
    console.error(err);
    res.status(500).end();
  }
});

module.exports = router;
