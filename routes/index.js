const express = require('express');
const router = express.Router();
const products = require('../data/all.json');
const { version } = require('../package.json');

const curlHelp = `eol.bar ${version}

EoL dates chart from endoflife.date

USAGE:
    curl eol.bar/[PRODUCT]?from=[CYCLE|DATE]&to=[CYCLE|DATE]

PARAMS:
    from    Filter products older than the value.
    to      Filter products newer than the value.

PRODUCTS:
    ${products.map((p, i) => p + (i % 3 !== 2 ? space(30 - p.length) : '\n    ')).join('')}
`;

router.get('/', (req, res) => {
  const ua = req.get('User-Agent');
  if (new RegExp('^curl\/').test(ua)) {
    res.send(curlHelp);
    return;
  }
  res.render('index', { message: curlHelp });
});

function space(num) {
  let space = '';
  for (let i = 0; i < num; i++) {
    space += ' ';
  }
  return space;
}

module.exports = router;
