class AnsiHelp {
  constructor(products, version) {
    this.products = products;
    this.version = version;
  }

  render() {
    return `eol.bar ${this.version}

Displays EoL schedule.
Visit https://eol.bar to know details.

USAGE:
    curl eol.bar/[PATH]?from=[DATE]&to=[DATE]

PATH:
    Expression to list products.

PARAMS:
    from    Crop schedule older than the value.
    to      Crop schedule newer than the value.

EXAMPLES:
    curl eol.bar/nodejs
    curl eol.bar/nodejs+php
    curl eol.bar/nodejs<=12+php=7.*
    curl eol.bar/php=7.*.svg?from=2019-02-01&to=2021-11-30

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
