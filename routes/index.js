const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const data = require('../data.json');
const { version } = require('../package.json');
const AnsiHelp = require('../lib/ansi-help');

router.get('/', async (req, res) => {
  const ua = req.get('User-Agent');
  const products = await Promise.all(data.filter(async (product) => {
    const cycles = JSON.parse(await db.get(product));
    if (!cycles) {
      return false;
    }
    const exp = /^\d{4}-\d{2}-\d{2}$/;
    return cycles.every((cycle) => exp.test(cycle.releaseDate));
  }).map(async (product) =>({
    name: product,
    data: JSON.parse(await db.get(product)),
  })));
  if (new RegExp('^curl\/').test(ua)) {
    const ansi = new AnsiHelp(products.map(({ name }) => name), version);
    res.send(ansi.render());
    return;
  }
  res.render('index', { version, products });
});

module.exports = router;
