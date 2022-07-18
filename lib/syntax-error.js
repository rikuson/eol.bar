class SyntaxError extends Error {
  constructor(exp, code = 400) {
    super(`invalid expression \`${exp}\`.`);
    this.exp = exp;
    this.code = code;
  }
}

module.exports = SyntaxError;
