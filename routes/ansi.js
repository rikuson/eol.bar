const express = require('express');
const didYouMean = require('didyoumean');
const router = express.Router({ mergeParams: true });
const db = require('../lib/db');
const products = require('../data.json');
const Product = require('../lib/product')
const Gantt = require('../lib/ansi-gantt');
const { uniqDate, cloneDate, firstDay, nextMonth, time } = require('../lib/util');
const { parse } = require('../lib/tokenizer');
const { version } = require('../package.json');
const NotFoundError = require('../lib/not-found-error');
const SyntaxError = require('../lib/syntax-error');

router.get('/', async (req, res) => {
  const ua = req.get('User-Agent');
  if (!(new RegExp('^curl\/').test(ua))) {
    res.status(404).end();
    return;
  }
  try {
    const targets = await Promise.all(parse(req.params.products).map(async (target) => {
      const exists = products.includes(target.product);
      if (!exists) {
        throw new NotFoundError(target.product);
      }
      return {
        ...target,
        data: JSON.parse(await db.get(target.product)),
      };
    }));
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
    res.send(gantt.render());
  } catch (err) {
    const red = '\x1b[31m';
    const reset = '\x1b[0m';
    let msg = '';
    msg += `${red}[Error]${reset} ${err.message} `;
    msg += `See 'curl eol.bar'.\n`;
    if (err instanceof NotFoundError) {
      didYouMean.threshold = 0.6;
      const suggestion = didYouMean(err.target, products);
      if (suggestion) {
        msg += `\nThe most similar product is\n`;
        msg += `        ${suggestion}\n`;
      }
      res.send(msg).status(err.code).end();
      return;
    }
    if (err instanceof SyntaxError) {
      res.send(msg).status(err.code).end();
      return;
    }
    console.error(err);
    res.status(500).end();
  }
});

module.exports = router;
