const express = require('express');
const router = express.Router({ mergeParams: true });
const StrGantt = require('gantt/lib/StrGantt').default;
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const products = require('../data/all.json');
const Product = require('../product.js')

router.get('/', (req, res) => {
  const targets = req.params.products.split('+').filter((p) => products.includes(p));
  if (!targets.length) {
    res.status(404).end();
    return;
  }
  const rows = targets.flatMap((target) => {
    const product = new Product(require(`../data/${target}.json`));
    return product.search(req.query).map(row.bind(null, target));
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

function row(target, { meta, release, eol, support, cycle }) {
  const supportPeriod = support.getTime() - release.getTime();
  const allPeriod = eol.getTime() - release.getTime();
  return {
    id: meta.id,
    text: `${target} ${cycle}`,
    start: release,
    end: eol,
    percent: eol < meta.searchAt ? 0 : supportPeriod / allPeriod,
  };
}

module.exports = router;
