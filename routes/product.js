const express = require('express');
const router = express.Router({ mergeParams: true });
const products = require('../data/all.json');
const Product = require('../lib/product')
const Gantt = require('../lib/gantt');

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
  const gantt = new Gantt(rows);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(gantt.render());
});

module.exports = router;
