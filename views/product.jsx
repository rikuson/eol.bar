const React = require('react');

function Product({ rows }) {
  const columns = uniqDate(
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
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${145.195 + 108.080 * columns.length} ${75.397 + rows.length * 69.841}`}>
      <g fontSize="10" fontFamily="sans-serif" textAnchor="middle">
        <g>
          {columns.map((c, i) => (
            <Column
              key={i}
              height={20.952 + rows.length * 69.841}
              offset={i * 108.080}
              index={i}
            >
              {enMonth(c.getMonth())} {c.getFullYear()}
            </Column>
          ))}
        </g>
      </g>
      <g fill="none" fontSize="10" fontFamily="sans-serif">
        <g>
          {rows.map((r, i) => (
            <Row key={i} height={108.080 * columns.length} offset={i * 69.841}>
              {r.meta.name} {r.cycle}
            </Row>
          ))}
        </g>
      </g>
      {rows.map(({ meta, release, support, eol }, i) => [
        <Bar
          {...barPosition(columns, release, support ? support : eol)}
          offsetY={i * 69.841}
          color={meta.searchAt > eol ? '#FF5C54' : '#47b4ff'}
        >
          ACTIVE
        </Bar>,
        support && (
          <Bar
            {...barPosition(columns, support, eol)}
            offsetY={i * 69.841}
            color={meta.searchAt > eol ? '#FF5C54' : '#89a19d'}
          >
            MAINTENANCE
          </Bar>
        )
      ])}
      <Current rows={rows} columns={columns} />
    </svg>
  );
}

function Column({ height, offset, children, index }) {
  return <>
    <path
      stroke="#89a19d"
      strokeDasharray={index % 2 === 0 ? '0' : '2,2'}
      d={`M.5 0v${height}`}
      transform={`translate(${145.195 + offset} 30)`}
    ></path>
    <text
      fill="#000"
      x=".5"
      dy="-10"
      transform={`translate(${145.195 + offset} 30)`}
    >
      {children}
    </text>
  </>;
}

function Row({ height, offset, children }) {
  return <>
    <path
      stroke="#e1e7e7"
      d={`M0 .5h${height}`}
      transform={`translate(60 ${75.397 + offset})`}
    ></path>
    <text
      fill="#000"
      y=".5"
      dy=".32em"
      dx="-10"
      transform={`translate(60 ${75.397 + offset})`}
    >
      {children}
    </text>
  </>;
}

function Bar({ offsetX, offsetY, width, color, children }) {
  return <>
    <path
      d={`M0 ${20.952 + offsetY}h${width}v48.889H0z`}
      transform={`translate(${145 + offsetX} 30)`}
      fill={color}
    ></path>
    <text
        fill="#fff"
        x="15"
        y={47.397 + offsetY}
        transform={`translate(${145 + offsetX} 30)`}
        style={{ font: '20px sans-serif', fontWeight: 100, dominantBaseline: 'middle' }}
    >
      {children}
    </text>
  </>;
}

function Current({ columns, rows }) {
  const now = new Date();
  const i = columns.findIndex((m) => m >= now) - 1;
  if (i < 0) {
    return;
  }
  const prev = columns[i];
  const next = columns[i + 1];
  return <path
    stroke="#FF5C54"
    d={`M.5 0v${20.952 + rows.length * 69.841}`}
    transform={`translate(${145.195 + 108.080  * (i + (now - prev) / (next - prev))} 30)`}
  ></path>
}

function uniqDate(dates) {
  const times = dates.map((d) => d.getTime());
  return Array.from(new Set(times)).map((t) => new Date(t));
}

function barPosition(columns, start, end) {
  const si = columns.findIndex((m) => m >= start) - 1;
  const ei = columns.findIndex((m) => m >= end) - 1;
  const offset = 108.080 * (si + (start - columns[si]) / (columns[si + 1] - columns[si]));
  const distance = 108.080 * (ei + (end - columns[ei]) / (columns[ei + 1] - columns[ei]));
  return { offsetX: offset, width: distance - offset };
}

function enMonth(i) {
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

module.exports = Product;
