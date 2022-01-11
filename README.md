# eol.bar

[![CI](https://github.com/rikuson/eol.bar/actions/workflows/node.js.yml/badge.svg)](https://github.com/rikuson/eol.bar/actions/workflows/node.js.yml)

Display endoflife schedule on graphical interface.

## Development

### Fetch data

Fetch data from [endoflife.date](https://endoflife.date).

```bash
$ npm run prestart
$ NODE_ENV=development npm run fetch
```

### Start development server

Start web server with watching file change.  
NOTE: Execute this after fetching data.

```bash
$ npm run dev
```
