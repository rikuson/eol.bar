const express = require('express');
const router = express.Router();
const products = require('../data/all.json');
const { version } = require('../package.json');
const AnsiHelp = require('../lib/ansi-help');

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
  res.render('index', { version, products: data });
});

module.exports = router;
