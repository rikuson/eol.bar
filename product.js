class Product {
  constructor(data) {
    this.cycles = data.map(this._parse.bind(this, new Date()));
  }

  search(query) {
    const { from, to } = query;
    return this.cycles.filter((cycle) => {
      if (!from && !to) {
        return cycle.eol >= cycle.searchAt;
      }
      return this._inRange(cycle, from, to);
    });
  }

  _inRange({ release, eol, cycle }, from, to) {
    let result = true;
    if (this._isDate(from)) {
      result *= release >= new Date(from);
    } else if (this._isCycle(from)) {
      result *= cycle >= Number(from);
    }
    if (this._isDate(to)) {
      result *= eol <= new Date(to);
    } else if (this._isCycle(to)) {
      result *= cycle <= Number(to);
    }
    return result;
  }

  _parse(now, row, i) {
    return {
      ...row,
      meta: {
        id: i + 1,
        searchAt: now,
      },
      release: new Date(row.release),
      eol: new Date(row.eol),
      support: new Date(row.support),
      cycle: Number(row.cycle),
    };
  }

  _isDate(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
  }

  _isCycle(str) {
    return /^\d+.\d+/.test(str);
  }
}

module.exports = Product;
