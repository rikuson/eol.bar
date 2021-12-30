const wcmatch = require('wildcard-match');

class Product {
  static get PATTERN() {
    return /^([^>=<@]+)($|(>=|>|<|<=|=|@)([^>=<@]+))/;
  }

  constructor(expression) {
    const match = expression.match(Product.PATTERN);
    if (!match) {
      throw new Error(`Invalid expression: ${expression}`);
    }
    this.name = match[1];
    this.operator = match[3];
    this.comparison = match[4];
    this.cycles = [];
  }

  setData(data) {
    const cycles = data.map(this._parse.bind(this, new Date()));
    if (!this.operator || !this.comparison) {
      this.cycles = cycles.filter((d) => d.eol >= d.meta.searchAt);
      return;
    }
    const isMatch = wcmatch(this.comparison);
    const matchs = cycles.filter(({ cycle }) => isMatch(cycle));
    if (!matchs.length) {
      throw new Error('No cycle is matched');
    }
    this.cycles = cycles
      .filter((d) => {
        if (this.operator === '=' || this.operator === '@') {
          return matchs.some(({ cycle }) => d.cycle === cycle);
        }
        const index = (() => {
          switch (this.operator) {
            case '<':
            case '>=':
              return matchs[matchs.length - 1].meta.index;
            case '>':
            case '<=':
              return matchs[0].meta.index;
            default:
              throw new Error(`Invalid operator: ${operator}`);
          }
        })();
        return this._evaluate(data.length - d.meta.index, this.operator, data.length - index);
      });
  }

  _evaluate(a, operator, b) {
    switch (operator) {
      case '>=':
        return a >= b;
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '<=':
        return a <= b;
      default:
        throw new Error(`Invalid operator: ${operator}`);
    }
  }

  _parse(now, row, i) {
    return {
      ...row,
      meta: {
        index: i,
        name: this.name,
        searchAt: now,
      },
      release: new Date(row.release),
      eol: new Date(row.eol),
      support: new Date(row.support),
      cycle: row.cycle,
    };
  }
}

module.exports = Product;
