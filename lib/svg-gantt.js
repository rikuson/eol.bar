const { XMLBuilder } = require('fast-xml-parser');
const { month } = require('../lib/util');

class SvgGantt {
  static get HEADER_OFFSET() {
    return 75.397;
  }

  static get COLUMN_OFFSET() {
    return 145.195;
  }

  static get COLUMN_WIDTH() {
    return 108.080;
  }

  static get ROW_HEIGHT() {
    return 69.841;
  }

  constructor(rows, columns) {
    const width = SvgGantt.COLUMN_OFFSET + SvgGantt.COLUMN_WIDTH * columns.length;
    const height = SvgGantt.HEADER_OFFSET + SvgGantt.ROW_HEIGHT * rows.length;
    this.nodes = {
      svg: {
        '@_xmlns': 'http://www.w3.org/2000/svg',
        '@_viewBox': `0 0 ${width} ${height}`,
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
          {
            g: [],
          },
        ],
      },
    };

    this.nodes.svg.g[0].g = columns.map((c, i) =>
      this._headerNode(
        20.952 + rows.length * SvgGantt.ROW_HEIGHT,
        i * SvgGantt.COLUMN_WIDTH,
        `${month(c.getMonth())} ${c.getFullYear()}`,
        i
      )
    );
    this.nodes.svg.g[1].g = rows.map((r, i) =>
      this._rowNode(
        SvgGantt.COLUMN_WIDTH * columns.length,
        i * SvgGantt.ROW_HEIGHT,
        `${r.meta.name} ${r.cycle}`
      )
    );
    this.nodes.svg.g[2].g = rows.flatMap(({ meta, release, support, eol }, i) => {
      const active = this._barPosition(columns, release, support ? support : eol);
      const maintenance = this._barPosition(columns, support, eol)
      return [
        this._barNode(
          active.offsetX,
          i * SvgGantt.ROW_HEIGHT,
          active.width,
          meta.searchAt > eol ? '#FF5C54' : '#47b4ff',
          'ACTIVE'
        ),
        support && this._barNode(
          maintenance.offsetX,
          i * SvgGantt.ROW_HEIGHT,
          maintenance.width,
          meta.searchAt > eol ? '#FF5C54' : '#89a19d',
          'MAINTENANCE'
        ),
      ];
    });
    this.nodes.svg.g.push(this._timeLineNode(rows, columns));
    this.xml = new XMLBuilder({ ignoreAttributes: false });
  }

  _headerNode(height, offset, text, index) {
    return {
      path: {
        '@_stroke': '#89a19d',
        '@_stroke-dasharray': index % 2 === 0 ? '0' : '2,2',
        '@_d': `M.5 0v${height}`,
        '@_transform': `translate(${SvgGantt.COLUMN_OFFSET + offset} 30)`,
      },
      text: {
        '@_fill': '#000',
        '@_x': '.5',
        '@_dy': '-10',
        '@_transform': `translate(${SvgGantt.COLUMN_OFFSET + offset} 30)`,
        '#text': text,
      },
    };
  }

  _timeLineNode(rows, columns) {
    const now = new Date();
    const i = columns.findIndex((m) => m >= now) - 1;
    if (i < 0) {
      return;
    }
    const prev = columns[i];
    const next = columns[i + 1];
    return {
      path: {
        '@_stroke': '#FF5C54',
        '@_d': `M.5 0v${20.952 + rows.length * SvgGantt.ROW_HEIGHT}`,
        '@_transform': `translate(${SvgGantt.COLUMN_OFFSET + SvgGantt.COLUMN_WIDTH  * (i + (now - prev) / (next - prev))} 30)`,
      },
    };
  }

  _rowNode(height, offset, text) {
    return {
      path: {
        '@_stroke': '#e1e7e7',
        '@_d': `M0 .5h${height}`,
        '@_transform': `translate(60 ${SvgGantt.HEADER_OFFSET + offset})`,
      },
      text: {
        '@_fill': '#000',
        '@_y': '.5',
        '@_dy': '.32em',
        '@_dx': '-10',
        '@_transform': `translate(60 ${SvgGantt.HEADER_OFFSET + offset})`,
        '#text': text,
      },
    };
  }

  _barNode(offsetX, offsetY, width, color, text) {
    return {
      path: {
        '@_d': `M0 ${20.952 + offsetY}h${width}v48.889H0z`,
        '@_transform': `translate(${145 + offsetX} 30)`,
        '@_fill': color,
      },
      text: {
        '@_fill': '#fff',
        '@_x': '15',
        '@_y': 47.397 + offsetY,
        '@_transform': `translate(${145 + offsetX} 30)`,
        '@_style': 'font: 20px sans-serif; font-weight: 100; dominant-baseline: middle;',
        '#text': text,
      },
    };
  }

  _barPosition(columns, start, end) {
    if (!start || !end) {
      return;
    }
    const si = columns.findIndex((m) => m >= start) - 1;
    const ei = columns.findIndex((m) => m >= end) - 1;
    const offset = SvgGantt.COLUMN_WIDTH * (si + (start - columns[si]) / (columns[si + 1] - columns[si]));
    const distance = SvgGantt.COLUMN_WIDTH * (ei + (end - columns[ei]) / (columns[ei + 1] - columns[ei]));
    return { offsetX: offset, width: distance - offset };
  }

  render() {
    return this.xml.build(this.nodes);
  }
}

module.exports = SvgGantt;
