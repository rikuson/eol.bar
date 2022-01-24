const { execSync } = require('child_process');
const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const data = require('../data.json');
const { version } = require('../package.json');
const AnsiHelp = require('../lib/ansi-help');
const Product = require('../lib/product')
const AnsiGantt = require('../lib/ansi-gantt');
const { uniqDate, cloneDate, firstDay, nextMonth } = require('../lib/util');

router.get('/', async (req, res) => {
  const ua = req.get('User-Agent');
  const products = await Promise.all(data.filter(async (product) => {
    const cycles = JSON.parse(await db.get(product));
    if (!cycles) {
      return false;
    }
    const exp = /^\d{4}-\d{2}-\d{2}$/;
    return cycles.every((cycle) => exp.test(cycle.release));
  }).map(async (product) =>({
    name: product,
    data: JSON.parse(await db.get(product)),
  })));
  if (new RegExp('^curl\/').test(ua)) {
    const ansi = new AnsiHelp(products.map(({ name }) => name), version);
    res.send(ansi.render());
    return;
  }
  const product = new Product(JSON.parse(await db.get('nodejs')));
  const rows = product.search('nodejs');
  const columns = uniqDate(
    rows.flatMap(({ release, support, eol }) => [
      release && firstDay(cloneDate(release)),
      support && firstDay(cloneDate(support)),
      eol && firstDay(nextMonth(cloneDate(eol))),
    ]).filter((d) => d).sort((a, b) => a > b ? 1 : -1)
  );
  const gantt = new AnsiGantt(rows, columns);
  const example = ((str) => {
    str = str.replaceAll('\n      ', '\n');
    str = str.replaceAll('\n', '<br />');
    str = str.replaceAll('\x1b[37m\x1b[44m', '<span class="active">');
    str = str.replaceAll('\x1b[37m\x1b[100m', '<span class="maintenance">');
    str = str.replaceAll('\x1b[0m', '</span>');
    return '<br />' + str + '>';
  })(gantt.render());
  res.render('index', { version, products, example });
});

module.exports = router;
