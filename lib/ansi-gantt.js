const { range, uniq, month, join } = require('../lib/util');

class AnsiGantt {
  static get TITLE_WIDTH() {
    return 15;
  }

  static get COLUMN_WIDTH() {
    return 10;
  }

  constructor(rows, columns) {
    const header = this._header(columns);
    const separator = this._separator(columns);
    const list = rows.map(({ meta, cycle, release, support, eol }) => {
      let line = '';
      line += this._textRight(cycle ? `${meta.name} ${cycle}` : meta.name, AnsiGantt.TITLE_WIDTH);
      if (!release) {
        line += separator.slice(
          AnsiGantt.TITLE_WIDTH,
          AnsiGantt.TITLE_WIDTH + AnsiGantt.COLUMN_WIDTH / 2
        );
        line += '\x1b[31m No data\x1b[0m';
        line += separator.slice(
          AnsiGantt.TITLE_WIDTH + AnsiGantt.COLUMN_WIDTH / 2 + 8
        );
        return line;
      }
      const active = this._barPosition(columns, release, support ? support : eol);
      line += separator.slice(
        AnsiGantt.TITLE_WIDTH,
        AnsiGantt.TITLE_WIDTH + Math.floor(active.offsetX)
      );
      line += this._bar(active.offsetX, Math.floor(active.width), 'blue', 'ACTIVE');
      if (support) {
        const maintenance = this._barPosition(columns, support, eol);
        line += this._bar(maintenance.offsetX, Math.floor(maintenance.width), 'gray', 'MAINTENANCE');
        line += separator.slice(
          AnsiGantt.TITLE_WIDTH +
          Math.floor(active.offsetX) +
          Math.floor(active.width) +
          Math.floor(maintenance.width)
        );
      } else {
        line += separator.slice(
          AnsiGantt.TITLE_WIDTH +
          Math.floor(active.offsetX) +
          Math.floor(active.width)
        );
      }
      return line;
    });
    this.lines = '\n' + [
      header,
      ...list,
    ].join(`\n${separator}\n`) + `\n${separator}\n`;
  }

  render() {
    return this.lines;
  }

  _header(columns) {
    const offsetX = join(range(AnsiGantt.TITLE_WIDTH, ' '));
    const text = (c) => `${month(c.getMonth())} ${c.getFullYear()}`;
    const cols = join(columns, (c) => this._textCenter(text(c), AnsiGantt.COLUMN_WIDTH));
    return offsetX + cols;
  }

  _separator(columns) {
    const offsetX = join(range(AnsiGantt.TITLE_WIDTH - AnsiGantt.COLUMN_WIDTH / 2 - 1, ' '));
    const cols = columns.map(() => join(range(AnsiGantt.COLUMN_WIDTH - 2, ' '))).join('|') + '|';
    return offsetX + cols;
  }

  _bar(offsetX, width, color, text) {
    const bg = color === 'blue' ? '\x1b[37m\x1b[44m' : '\x1b[37m\x1b[100m';
    const content = (' ' + text + join(range(width - 1, ' '))).slice(0, width);
    const reset = '\x1b[0m';
    return bg + content + reset;
  }

  _textRight(str, length) {
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

  _textCenter(str, length) {
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

  _barPosition(columns, start, end) {
    if (!start || !end) {
      return;
    }
    const si = columns.findIndex((m) => m >= start) - 1;
    const ei = columns.findIndex((m) => m >= end) - 1;
    const offset = AnsiGantt.COLUMN_WIDTH * (si + (start - columns[si]) / (columns[si + 1] - columns[si]));
    const distance = AnsiGantt.COLUMN_WIDTH * (ei + (end - columns[ei]) / (columns[ei + 1] - columns[ei]));
    return { offsetX: offset + AnsiGantt.COLUMN_WIDTH / 2, width: distance - offset };
  }
}

module.exports = AnsiGantt;
