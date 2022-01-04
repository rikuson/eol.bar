const { XMLBuilder } = require('fast-xml-parser');

class Gantt {
  constructor(rows) {
    this.rows = rows;
    this.draw = {
      svg: {
        '@_xmlns': 'http://www.w3.org/2000/svg',
        g: [
          {
            '@_font-size': '10',
            '@_font-family': 'sans-serif',
            '@_text-anchor': 'middle',
            g: [],
          },
          {
            '@_fill': 'none',
            '@_font-size': '10',
            '@_font-family': 'sans-serif',
            g: [],
          },
        ],
      },
    };
    this.columns = this._uniqDate(
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
    );
    this.columns.forEach(this._drawColumn.bind(this));
    rows.forEach(this._drawRow.bind(this));
    rows.forEach(this._drawBar.bind(this));
    this.xml = new XMLBuilder({ ignoreAttributes: false });
    this._drawCurrent();
  }

  _drawColumn(date, i) {
    this.draw.svg.g[0].g.push({
      path: {
        '@_stroke': '#89a19d',
        '@_stroke-dasharray': i % 2 === 0 ? '0' : '2,2',
        '@_d': `M.5 0v${20.952 + this.rows.length * 69.841}`,
        '@_transform': `translate(${145.195 + i * 108.080} 30)`,
      },
      text: {
        '@_fill': '#000',
        '@_x': '.5',
        '@_dy': '-10',
        '@_transform': `translate(${145.195 + i * 108.080} 30)`,
        '#text': `${this._enMonth(date.getMonth())} ${date.getFullYear()}`,
      },
    });
  }

  _drawCurrent() {
    const now = new Date();
    const i = this.columns.findIndex((m) => m >= now) - 1;
    if (i < 0) {
      return;
    }
    const prev = this.columns[i];
    const next = this.columns[i + 1];
    this.draw.svg.g.push({
      path: {
        '@_stroke': '#FF5C54',
        '@_d': `M.5 0v${20.952 + this.rows.length * 69.841}`,
        '@_transform': `translate(${145.195 + 108.080  * (i + (now - prev) / (next - prev))} 30)`,
      },
    });
  }

  _drawRow({ meta, cycle }, i) {
    this.draw.svg.g[1].g.push({
      path: {
        '@_stroke': '#e1e7e7',
        '@_d': `M0 .5h${108.080 * this.columns.length}`,
        '@_transform': `translate(60 ${75.397 + i * 69.841})`,
      },
      text: {
        '@_fill': '#000',
        '@_y': '.5',
        '@_dy': '.32em',
        '@_dx': '-10',
        '@_transform': `translate(60 ${75.397 + i * 69.841})`,
        '#text': `${meta.name} ${cycle}`,
      },
    });
  }

  _drawBar({ meta, release, support, eol }, i) {
    const active = this._barPosition(release, support ? support : eol);
    this.draw.svg.g.push({
      path: {
        '@_d': `M0 ${20.952 + i * 69.841}h${active.width}v48.889H0z`,
        '@_transform': `translate(${145 + active.offset} 30)`,
        '@_fill': meta.searchAt > eol ? '#FF5C54' : '#47b4ff',
      },
      text: {
        '@_fill': '#fff',
        '@_x': '15',
        '@_y': 47.397 + i * 69.841,
        '@_transform': `translate(${145 + active.offset} 30)`,
        '@_style': 'font: 20px sans-serif; font-weight: 100; dominant-baseline: middle;',
        '#text': 'ACTIVE',
      },
    });
    if (support) {
      const maintenance = this._barPosition(support, eol);
      this.draw.svg.g.push({
        path: {
          '@_d': `M0 ${20.952 + i * 69.841}h${maintenance.width}v48.889H0z`,
          '@_transform': `translate(${145 + maintenance.offset} 30)`,
          '@_fill': meta.searchAt > eol ? '#FF5C54' : '#89a19d',
        },
        text: {
          '@_fill': '#fff',
          '@_x': '15',
          '@_y': 47.397 + i * 69.841,
          '@_transform': `translate(${145 + maintenance.offset} 30)`,
          '@_style': 'font: 20px sans-serif; font-weight: 100; dominant-baseline: middle;',
          '#text': 'MAINTENANCE',
        },
      });
    }
  }

  _barPosition(start, end) {
    const si = this.columns.findIndex((m) => m >= start) - 1;
    const ei = this.columns.findIndex((m) => m >= end) - 1;
    const offset = 108.080 * (si + (start - this.columns[si]) / (this.columns[si + 1] - this.columns[si]));
    const distance = 108.080 * (ei + (end - this.columns[ei]) / (this.columns[ei + 1] - this.columns[ei]));
    return { offset, width: distance - offset };
  }

  _enMonth(i) {
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

  _uniqDate(dates) {
    const times = dates.map((d) => d.getTime());
    return Array.from(new Set(times)).map((t) => new Date(t));
  }

  render() {
    this.draw.svg['@_viewBox'] = `0 0 ${145.195 + 108.080 * this.columns.length} ${75.397 + this.rows.length * 69.841}`;
    return this.xml.build(this.draw);
  }
}

module.exports = Gantt;
