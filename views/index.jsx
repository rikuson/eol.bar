const React = require('react');

function Index(props) {
  return (
    <html>
      <head>
        <title>Top</title>
      </head>
      <body style={{ background: 'black', color: '#bbb' }}>
        <pre>{props.message}</pre>
      </body>
    </html>
  );
}

module.exports = Index;
