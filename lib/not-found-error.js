class NotFoundError extends Error {
  constructor(target, code = 404) {
    super(`${target} is not found.`);
    this.target = target;
    this.code = code;
  }
}

module.exports = NotFoundError;
