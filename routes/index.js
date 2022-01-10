const { execSync } = require('child_process');
const express = require('express');
const router = express.Router();
const products = require('../data/all.json');
const { version } = require('../package.json');
const AnsiHelp = require('../lib/ansi-help');
const Product = require('../lib/product')
const AnsiGantt = require('../lib/ansi-gantt');
const { uniqDate, cloneDate, firstDay, nextMonth } = require('../lib/util');

router.get('/', (req, res) => {
  const ua = req.get('User-Agent');
  const data = products.filter((product) => {
    const cycles = require(`../data/${product}.json`);
    const exp = /^\d{4}-\d{2}-\d{2}$/;
    return cycles.every((cycle) => exp.test(cycle.release) && exp.test(cycle.eol));
  });
  if (new RegExp('^curl\/').test(ua)) {
    const ansi = new AnsiHelp(data, version);
    res.send(ansi.render());
    return;
  }
  const product = new Product(require('../data/nodejs.json'));
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
    str = str.replaceAll('[37m[44m', '<span class="active">');
    str = str.replaceAll('[37m[100m', '<span class="maintenance">');
    str = str.replaceAll('[49m[39m', '</span>');
    return '<br />' + str + '>';
  })(gantt.render());
  res.render('index', { version, products: data, example });
});

module.exports = router;
