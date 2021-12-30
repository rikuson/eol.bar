class Product {
  static get PATTERN() {
    return /^([^>=<]+)($|(>=|>|<|<=|=)(.+))/;
  }

  constructor(expression) {
    const match = expression.match(Product.PATTERN);
    this.name = match[1];
    this.operator = match[3];
    this.comparison = match[4];
    this.cycles = [];
  }

  setData(data) {
    const index = data.findIndex(({ cycle }) => cycle === this.comparison);
    this.cycles = data
      .map(this._parse.bind(this, new Date()))
      .filter((d) => {
        if (!this.operator || !this.comparison) {
          return d.eol >= d.meta.searchAt;
        }
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
      case '=':
        return a === b;
      default:
        throw new Error('Invalid operator');
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
