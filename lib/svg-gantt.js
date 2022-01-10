const { XMLBuilder } = require('fast-xml-parser');
const { month, nextMonth, cloneDate } = require('../lib/util');

class SvgGantt {
  static get HEADER_OFFSET() {
    return 75.397;
  }

  static get TITLE_WIDTH() {
    return 175.195;
  }

  static get COLUMN_WIDTH() {
    return 108.080;
  }

  static get ROW_HEIGHT() {
    return 69.841;
  }

  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns.length !== 1 ? columns : [
      ...columns,
      nextMonth(cloneDate(columns[0]))
    ];
    this.nodes = {
      svg: {
        '@_xmlns': 'http://www.w3.org/2000/svg',
        svg: [
          {
            g: {
              '@_font-size': '10',
              '@_font-family': 'sans-serif',
              g: [],
            },
          },
          {
            clipPath: {
              '@_id': 'clip',
              rect: {},
            },
            '@_clip-path': 'url(#clip)',
            '@_font-size': '10',
            '@_font-family': 'sans-serif',
            g: [
              {
                '@_text-anchor': 'middle',
                g: [],
              },
              {
                g: [],
              },
              {
                '@_fill': 'none',
                g: [],
              },
              {
                g: [],
              },
            ],
          },
        ],
      }
    };

    this.nodes.svg.svg[0].g.g = rows.map((r, i) =>
      this._titleNode(
        SvgGantt.COLUMN_WIDTH * this.columns.length - SvgGantt.COLUMN_WIDTH / 2,
        i * SvgGantt.ROW_HEIGHT,
        `${r.meta.name} ${r.cycle}`
      )
    );
    this.nodes.svg.svg[1].g[0].g = this.columns.map((c, i) =>
      this._headerNode(
        20.952 + rows.length * SvgGantt.ROW_HEIGHT,
        i * SvgGantt.COLUMN_WIDTH,
        `${month(c.getMonth())} ${c.getFullYear()}`,
        i
      )
    );
    this.nodes.svg.svg[1].g[0].g.push(this._timeLineNode(rows, this.columns));
    this.nodes.svg.svg[1].g[2].g = rows.map((r, i) =>
      this._rowNode(
        SvgGantt.COLUMN_WIDTH * this.columns.length - SvgGantt.COLUMN_WIDTH / 2,
        i * SvgGantt.ROW_HEIGHT
      )
    );
    this.nodes.svg.svg[1].g[3].g = rows.flatMap((row, i) => [
      this._barNode(
        row,
        i * SvgGantt.ROW_HEIGHT,
        'ACTIVE'
      ),
      row.support && this._barNode(
        row,
        i * SvgGantt.ROW_HEIGHT,
        'MAINTENANCE'
      ),
    ]);
    this.xml = new XMLBuilder({ ignoreAttributes: false });
  }

  _headerNode(height, offset, text, index) {
    return {
      path: {
        '@_stroke': '#89a19d',
        '@_stroke-dasharray': index % 2 === 0 ? '0' : '2,2',
        '@_d': `M.5 0v${height}`,
        '@_transform': `translate(${SvgGantt.TITLE_WIDTH + offset} 30)`,
      },
      text: {
        '@_fill': '#000',
        '@_x': '.5',
        '@_dy': '-10',
        '@_transform': `translate(${SvgGantt.TITLE_WIDTH + offset} 30)`,
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
        '@_d': `M.5 0v${20.952 + SvgGantt.ROW_HEIGHT * rows.length}`,
        '@_transform': `translate(${SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH  * (i + (now - prev) / (next - prev))} 30)`,
      },
      text: {
        '@_fill': '#FF5C54',
        '@_x': '.5',
        '@_dy': '-10',
        '@_transform': `translate(${SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH  * (i + (now - prev) / (next - prev))} ${71.904 + SvgGantt.ROW_HEIGHT * rows.length})`,
        '#text': `${month(now.getUTCMonth())} ${('0' + now.getUTCDate()).slice(-2)}`,
      },
    };
  }

  _titleNode(width, offsetY, text) {
    return {
      foreignObject: {
        '@_width': SvgGantt.TITLE_WIDTH - SvgGantt.COLUMN_WIDTH / 4 - 15,
        '@_height': 50,
        '@_transform': `translate(10 ${SvgGantt.HEADER_OFFSET + offsetY - 7})`,
        '@_style': 'text-align: right;',
        '#text': text,
      },
    };
  }

  _rowNode(width, offsetY) {
    const offsetX = SvgGantt.TITLE_WIDTH - SvgGantt.COLUMN_WIDTH / 4;
    return {
      path: {
        '@_stroke': '#e1e7e7',
        '@_d': `M0 .5h${width}`,
        '@_transform': `translate(${offsetX} ${SvgGantt.HEADER_OFFSET + offsetY})`,
      },
    };
  }

  _barNode({ meta, release, support, eol }, offsetY, text) {
    if (!release) {
      return {
        text: {
          '@_fill': '#000',
          '@_x': '15',
          '@_y': 47.397 + offsetY,
          '@_transform': `translate(${SvgGantt.TITLE_WIDTH} 30)`,
          '@_style': 'font: 20px sans-serif; font-weight: 100; dominant-baseline: middle;',
          '#text': 'No data',
        }
      };
    }
    const start = text === 'ACTIVE' ? release : support;
    const end = text === 'ACTIVE' && support ? support : eol;
    const { offsetX, width } = this._barPosition(start, end);
    const color = eol && meta.searchAt > eol ? '#FF5C54' : (
      text === 'ACTIVE' ? '#47b4ff' : '#89a19d'
    );
    const node = {
      path: {
        '@_d': `M0 ${20.952 + offsetY}h${width}v48.889H0z`,
        '@_transform': `translate(${offsetX} 30)`,
        '@_fill': color,
      },
      text: [{
        '@_fill': '#fff',
        '@_x': '15',
        '@_y': 47.397 + offsetY,
        '@_transform': `translate(${offsetX} 30)`,
        '@_style': 'font: 20px sans-serif; font-weight: 100; dominant-baseline: middle;',
        '#text': text,
      }],
    };
    if (text === 'ACTIVE') {
      node.text.push({
        '@_fill': '#000',
        '@_x': '15',
        '@_y': 78.286 + offsetY,
        '@_transform': `translate(${offsetX - 28} 30)`,
        '@_font-size': 8,
        '@_font-weight': 100,
        '#text': `${month(start.getUTCMonth())} ${('0' + start.getUTCDate()).slice(-2)}`,
      });
    }
    if (end) {
      node.text.push({
        '@_fill': '#000',
        '@_x': '15',
        '@_y': 78.286 + offsetY,
        '@_transform': `translate(${offsetX + width - 28} 30)`,
        '@_font-size': 8,
        '@_font-weight': 100,
        '#text': `${month(end.getUTCMonth())} ${('0' + end.getUTCDate()).slice(-2)}`,
      });
    }
    return node;
  }

  _barPosition(start, end) {
    const si = this.columns.findIndex((m) => m >= start) - 1;
    const offset = SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * (si + (start - this.columns[si]) / (this.columns[si + 1] - this.columns[si]));
    if (!end) {
      const distance = SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * (0.25 + this.columns.length - 1);
      return { offsetX: offset, width: distance - offset };
    }
    const ei = this.columns.findIndex((m) => m >= end) - 1;
    const distance = SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * (ei + (end - this.columns[ei]) / (this.columns[ei + 1] - this.columns[ei]));
    return { offsetX: offset, width: distance - offset };
  }

  render(from, to) {
    const width = SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * this.columns.length;
    const height = SvgGantt.HEADER_OFFSET + SvgGantt.ROW_HEIGHT * this.rows.length;
    const nEarlier = this.columns.filter((c) => (from && c < new Date(from))).length;
    const nLater = this.columns.filter((c) => (to && c > new Date(to))).length;
    this.nodes.svg['@_viewBox'] = `0 0 ${SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * (this.columns.length - nLater + (nLater ? 0.25 : 0))} ${SvgGantt.HEADER_OFFSET + SvgGantt.ROW_HEIGHT * this.rows.length}`;
    this.nodes.svg.svg[0]['@_viewBox'] = `0 0 ${SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * (this.columns.length - nLater + (nLater ? 0.25 : 0))} ${SvgGantt.HEADER_OFFSET + SvgGantt.ROW_HEIGHT * this.rows.length}`;
    this.nodes.svg.svg[1]['@_viewBox'] = `${SvgGantt.COLUMN_WIDTH * nEarlier} 0 ${SvgGantt.TITLE_WIDTH + SvgGantt.COLUMN_WIDTH * (this.columns.length - nLater + (nLater ? 0.25 : 0))} ${SvgGantt.HEADER_OFFSET + SvgGantt.ROW_HEIGHT * this.rows.length}`;
    this.nodes.svg.svg[1].clipPath.rect = {
      '@_width': SvgGantt.COLUMN_WIDTH * (this.columns.length - nEarlier - nLater + 0.5),
      '@_transform': `translate(${SvgGantt.COLUMN_WIDTH * (nEarlier - 0.25) + SvgGantt.TITLE_WIDTH} 0)`,
      '@_height': height,
    };
    return this.xml.build(this.nodes);
  }
}

module.exports = SvgGantt;
