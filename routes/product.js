const express = require('express');
const router = express.Router({ mergeParams: true });
const StrGantt = require('gantt/lib/StrGantt').default;
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const products = require('../data/all.json');
const Product = require('../lib/product.js')

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
    return target.cycles.map(row);
  });
  const gantt = new StrGantt(rows, { viewMode: 'month' });
  res.setHeader('Content-Type', 'image/svg+xml');
  const parser = new XMLParser({ ignoreAttributes: false });
  const { svg } = parser.parse(gantt.render());
  const builder = new XMLBuilder({ ignoreAttributes: false });
  delete svg['@_width'];
  delete svg['@_height'];
  svg['@_xmlns'] = 'http://www.w3.org/2000/svg';
  res.send(builder.build({ svg }));
});

function row({ meta, release, eol, support, cycle }) {
  const supportPeriod = support.getTime() - release.getTime();
  const allPeriod = eol.getTime() - release.getTime();
  return {
    id: meta.index + 1,
    text: `${meta.name} ${cycle}`,
    start: release,
    end: eol,
    percent: eol < meta.searchAt ? 0 : supportPeriod / allPeriod,
  };
}

module.exports = router;
