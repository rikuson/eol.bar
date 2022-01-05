const chalk = require('chalk');
const { range, uniq } = require('../lib/util');

const LIST_WIDTH = 15;
const COLUMN_WIDTH = 10;

function render(rows) {
  const columns = uniq(
    rows
    .flatMap(({ release, support, eol }) => {
      const releaseClone = ((date) => {
        if (date) {
          date.setDate(1);
        }
        return date;
      })(release ? new Date(release.getTime()) : null)
      const supportClone = ((date) => {
        if (date) {
          date.setDate(1);
        }
        return date;
      })(support ? new Date(support.getTime()) : null);
      const eolClone = ((date) => {
        if (date) {
          date.setMonth(date.getMonth() + 1);
          date.setDate(1);
        }
        return date;
      })(eol ? new Date(eol.getTime()) : null);
      return [
        releaseClone,
        supportClone,
        eolClone,
      ];
    })
    .filter((d) => d)
    .sort((a, b) => a > b ? 1 : -1)
    .map((d) => d.getTime())
  ).map((t) => new Date(t));
  const header = range(0, LIST_WIDTH).fill(' ').join('') + columns.map(
    (date) => textCenter(`${enMonth(date.getMonth())} ${date.getFullYear()}`, COLUMN_WIDTH)
  ).join('');
  const spacer = header.replace(/./g, ' ');
  const separator = range(0, LIST_WIDTH - Math.floor(COLUMN_WIDTH / 2)).fill(' ').join('') + columns.map(() => range(0, COLUMN_WIDTH - 1).fill(' ').join('')).join('|') + '|';
  const list = rows.map(({ meta, cycle, release, support, eol }) => {
    let line = '';
    line += textRight(`${meta.name} ${cycle}`, LIST_WIDTH);
    const active = barPosition(columns, release, support ? support : eol);
    line += separator.slice(LIST_WIDTH, LIST_WIDTH + Math.floor(active.offset));
    line += chalk.white.bgBlue((' ACTIVE' + spacer).slice(0, Math.floor(active.width)));
    if (support) {
      const maintenance = barPosition(columns, support, eol);
      line += chalk.white.bgGray((' MAINTENANCE' + spacer).slice(0, Math.ceil(maintenance.width)));
      line += separator.slice(LIST_WIDTH + Math.ceil(maintenance.offset) + Math.floor(maintenance.width), separator.length);
    } else {
      line += separator.slice(LIST_WIDTH + Math.floor(active.offset) + Math.floor(active.width), separator.length);
    }
    return line;
  });
  return '\n' + [
    header,
    ...list,
  ].join(`\n${separator}\n`) + `\n${separator}\n`;
}

function textRight(str, length) {
  const nSpace = length > str.length ? length - str.length : 0;
  let res = '';
  for (let i = 0; i < nSpace; i++) {
    res += ' ';
  }
  for (let i = 0; i < length - nSpace; i++) {
    res += str[i];
  }
  return res;
}

function textCenter(str, length) {
  const nSpace = length > str.length ? length - str.length : 0;
  let res = '';
  for (let i = 0; i < Math.floor(nSpace / 2); i++) {
    res += ' ';
  }
  for (let i = 0; i < length - nSpace; i++) {
    res += str[i];
  }
  for (let i = 0; i < nSpace / 2; i++) {
    res += ' ';
  }
  return res;
}

function barPosition(columns, start, end) {
  const si = columns.findIndex((m) => m >= start) - 1;
  const ei = columns.findIndex((m) => m >= end) - 1;
  const offset = COLUMN_WIDTH * (si + (start - columns[si]) / (columns[si + 1] - columns[si]));
  const distance = COLUMN_WIDTH * (ei + (end - columns[ei]) / (columns[ei + 1] - columns[ei]));
  return { offset: offset + COLUMN_WIDTH / 2, width: distance - offset };
}

function enMonth(i) {
  return [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][i];
}

module.exports = { render };
