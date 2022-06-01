const { range, uniq, month, nextMonth, cloneDate, join } = require('../lib/util');

class AnsiGantt {
  static get TITLE_WIDTH() {
    return 15;
  }

  static get COLUMN_WIDTH() {
    return 10;
  }

  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns.length > 1 ? columns : [
      ...columns,
      nextMonth(cloneDate(columns[0]))
    ];
    const header = this._header(this.columns);
    const separator = this._separator(this.columns);
    const list = rows.map(({ meta, cycle, releaseDate, support, eol }) => {
      let line = '';
      line += `${meta.name} ${cycle}`.padStart(AnsiGantt.TITLE_WIDTH);
      if (!releaseDate) {
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
      const active = this._barPosition(releaseDate, support ? support : eol);
      line += separator.slice(
        AnsiGantt.TITLE_WIDTH,
        AnsiGantt.TITLE_WIDTH + Math.floor(active.offsetX)
      );
      line += this._bar(active.offsetX, Math.floor(active.width), 'blue', 'ACTIVE');
      if (support) {
        const maintenance = this._barPosition(support, eol);
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
    const cols = join(
      columns,
      (c) => (
        (month(c.getMonth()) + ' ').padStart(Math.floor(AnsiGantt.COLUMN_WIDTH / 2)) +
        (String(c.getFullYear()).padEnd(Math.ceil(AnsiGantt.COLUMN_WIDTH / 2)))
      )
    );
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

  _barPosition(start, end) {
    const si = this.columns.findIndex((m) => m >= start) - 1;
    const offset = AnsiGantt.COLUMN_WIDTH * (si + (start - this.columns[si]) / (this.columns[si + 1] - this.columns[si]));
    if (!end) {
      const distance = AnsiGantt.TITLE_WIDTH + AnsiGantt.COLUMN_WIDTH * Math.floor(0.25 + this.columns.length - 1);
      return { offsetX: offset, width: distance - offset };
    }
    const ei = this.columns.findIndex((m) => m >= end) - 1;
    const distance = AnsiGantt.COLUMN_WIDTH * (ei + (end - this.columns[ei]) / (this.columns[ei + 1] - this.columns[ei]));
    return { offsetX: offset + AnsiGantt.COLUMN_WIDTH / 2, width: distance - offset };
  }
}

module.exports = AnsiGantt;
