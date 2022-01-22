const SyntaxError = require('./syntax-error');

function parse(str) {
  const separator = '+';
  return str
    .split(separator)
    .map((expression) => {
      const pattern = /^([^>=<]+)($|(>=|>|<|<=|=)([^>=<]+))/;
      const match = expression.match(pattern);
      if (!match) {
        throw new SyntaxError(`Invalid expression: ${expression}`);
      }
      return {
        product: match[1],
        operator: match[3],
        value: match[4],
      };
    });
}

module.exports = { parse };
