const { assert, expect } = require('chai');
const { parse } = require('../lib/tokenizer');

describe('tokenizer', () => {
  describe('parse', () => {
    it('should parse equal', () => {
      assert.deepEqual(parse('product=1.0'), [
        { product: 'product', operator: '=', value: '1.0' }
      ]);
    });
  });
});

