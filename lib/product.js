const { wildcardMatch } = require('../lib/util');

class Product {
  constructor(data) {
    this.cycles = data.map(this._parse.bind(this));
  }

  search(product, operator, value) {
    const now = new Date();
    const cycles = this.cycles.map((cycle, i) => ({
      ...cycle,
      meta: {
        name: product,
        index: i,
        searchAt: now,
      },
    }));
    if (!operator || !value) {
      return cycles.filter((cycle) => cycle.eol >= cycle.meta.searchAt);
    }
    const matchs = cycles.filter(({ cycle }) => wildcardMatch(cycle, value));
    return cycles
      .filter((cycle) => {
        switch (operator) {
          case '=':
            return matchs.some((match) => cycle.cycle === match.cycle);
          case '>':
            return cycle.meta.index < matchs[0].meta.index;
          case '>=':
            return cycle.meta.index <= matchs[matchs.length - 1].meta.index;
          case '<':
            return cycle.meta.index > matchs[matchs.length - 1].meta.index;
          case '<=':
            return cycle.meta.index >= matchs[0].meta.index;
          default:
            throw new Error(`Invalid operator: ${operator}`);
        }
      });
  }

  _parse(row) {
    return {
      ...row,
      release: this._utcDate(row.release),
      eol: this._utcDate(row.eol),
      support: this._utcDate(row.support),
    };
  }

  _utcDate(str) {
    if (typeof str !== 'string') {
      return null;
    }
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      throw new Error(`Invalid date format: ${str}`);
    }
    const date = new Date();
    date.setUTCFullYear(match[1]);
    date.setUTCMonth(match[2] - 1);
    date.setUTCDate(match[3]);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
  }
}

module.exports = Product;
