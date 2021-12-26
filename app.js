const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const products = require('./data/all.json');
const StrGantt = require('gantt/lib/StrGantt').default;

const app = express();
const now = new Date();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:product.svg', (req, res) => {
  const { product } = req.params;
  if (!products.includes(product)) {
    return;
  }
  const data = require(`./data/${product}.json`);
  const { from, to } = req.query;
  const gantt = new StrGantt(
    data.map(columns).filter(({ start, end, text }) => {
      return end >= now;
      /* TODO
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
        result *= Number(text) <= Number(from);
      }
      return result;
      */
    }),
    { viewMode: 'month' }
  );
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg">${gantt.render()}</svg>`);
});

app.get('/:product/:cycle', (req, res) => {
  const { product, cycle } = req.params;
  if (!products.includes(product)) {
    return;
  }
  const data = require(`./data/${product}.json`);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send();
});

function isDate(str) {
  return /^\d\{4}-\d\{2}-\d\{2}$/.test(str);
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

module.exports = app;
