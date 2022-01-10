class AnsiHelp {
  constructor(products, version) {
    this.products = products;
    this.version = version;
  }

  render() {
    return `eol.bar ${this.version}

EoL dates chart from endoflife.date

USAGE:
    curl eol.bar/[PRODUCT]?from=[CYCLE|DATE]&to=[CYCLE|DATE]

PARAMS:
    from    Filter products older than the value.
    to      Filter products newer than the value.

PRODUCTS:
    ${this.products.map((p, i) => p + (i % 3 !== 2 ? this._space(30 - p.length) : '\n    ')).join('')}
`;
  }

  _space(num) {
    let space = '';
    for (let i = 0; i < num; i++) {
      space += ' ';
    }
    return space;
  }
}

module.exports = AnsiHelp;
