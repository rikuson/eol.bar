# eol.bar

[![Unit Test](https://github.com/rikuson/eol.bar/actions/workflows/node.js.yml/badge.svg)](https://github.com/rikuson/eol.bar/actions/workflows/node.js.yml)
[![Heath Check](https://github.com/rikuson/eol.bar/actions/workflows/curl.yml/badge.svg)](https://github.com/rikuson/eol.bar/actions/workflows/curl.yml)

Display endoflife schedule on graphical interface.

## Basic Usage

Put `img` tag in your project's wiki or something.
Alive lifecycles are shown as a default.

```html
<img src="https://eol.bar/nodejs.svg" />
```

[![img](http://localhost:3000/nodejs.svg)](http://localhost:3000/nodejs.svg)

To list multiple products, separate by `+`.

```html
<img src="https://eol.bar/nodejs+php.svg" />
```

[![img](http://localhost:3000/nodejs+php.svg)](http://localhost:3000/nodejs+php.svg)

## Advanced Usage

### Filtering

To filter lifecycles, put **comparison operator** after product name.
Available operators: `=`, `>`, `>=`, `<`, `<=`.

NOTE: Right-hand side value of operation should be existing lifecycle.

```html
<img src="https://eol.bar/nodejs<=12.svg" />
```

[![img](http://localhost:3000/nodejs%3C=12.svg)](http://localhost:3000/nodejs<=12.svg)

You can also use **wildcard** in a value.

```html
<img src="https://eol.bar/php=7.*.svg" />
```

[![img](http://localhost:3000/php=7.*.svg)](http://localhost:3000/php=7.*.svg)

### Cropping

To adjust width, crop by url parameters: `from` / `to`.

```html
<img src="https://eol.bar/php=7.*.svg?from=2019-02-01&to=2021-11-30"/>
```

[![img](http://localhost:3000/php=7.*.svg?from=2019-02-01&to=2021-11-30)](http://localhost:3000/php=7.*.svg?from=2019-02-01&to=2021-11-30)

### Curl

**eol.bar** returns ascii graphically by curl request.

NOTE: Currently, *Cropping* is not supported by curl request.

![php](./public/capture-php.gif)

Requesting root path shows help text.

![help](./public/capture-help.gif)

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
