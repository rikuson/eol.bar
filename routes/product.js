const express = require('express');
const router = express.Router({ mergeParams: true });
const StrGantt = require('gantt/lib/StrGantt').default;
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const products = require('../data/all.json');

const now = new Date();

router.get('/', (req, res) => {
  const { product } = req.params;
  if (!products.includes(product)) {
    return;
  }
  const data = require(`../data/${product}.json`);
  const { from, to } = req.query;
  const gantt = new StrGantt(
    data.map(columns).filter(({ start, end, text }) => {
      if (!from && !to) {
        return end >= now;
      }
      let result = true;
      if (isDate(from)) {
        result *= start >= new Date(from);
      } else if (isCycle(from)) {
        result *= Number(text) >= Number(from);
      }
      if (isDate(to)) {
        result *= end <= new Date(to);
      } else if (isCycle(to)) {
        result *= Number(text) <= Number(to);
      }
      return result;
    }),
    { viewMode: 'month' }
  );
  res.setHeader('Content-Type', 'image/svg+xml');
  const parser = new XMLParser({ ignoreAttributes: false });
  const { svg } = parser.parse(gantt.render());
  const builder = new XMLBuilder({ ignoreAttributes: false });
  delete svg['@_width'];
  delete svg['@_height'];
  svg['@_xmlns'] = 'http://www.w3.org/2000/svg';
  res.send(builder.build({ svg }));
});

function isDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

function isCycle(str) {
  return /^\d+.\d+/.test(str);
}

function columns({ cycle, release, support, eol }, i) {
  const start = new Date(release);
  const end = new Date(eol);
  const supportPeriod = new Date(support).getTime() - start.getTime();
  const allPeriod = end.getTime() - start.getTime();
  return {
    id: i + 1,
    text: cycle,
    start,
    end,
    percent: end < now ? 0 : supportPeriod / allPeriod,
  };
}

module.exports = router;
