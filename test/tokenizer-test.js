const { assert } = require('chai');
const { parse } = require('../lib/tokenizer');
const SyntaxError = require('../lib/syntax-error');

describe('tokenizer', () => {
  describe('parse', () => {
    it('should parse equal', () => {
      assert.deepEqual(parse('product=1.0'), [
        { product: 'product', operator: '=', value: '1.0' }
      ]);
    });
    it('should parse less than', () => {
      assert.deepEqual(parse('product<1.0'), [
        { product: 'product', operator: '<', value: '1.0' }
      ]);
    });
    it('should parse greater than', () => {
      assert.deepEqual(parse('product>1.0'), [
        { product: 'product', operator: '>', value: '1.0' }
      ]);
    });
    it('should parse less than or equal', () => {
      assert.deepEqual(parse('product<=1.0'), [
        { product: 'product', operator: '<=', value: '1.0' }
      ]);
    });
    it('should parse greater than or equal', () => {
      assert.deepEqual(parse('product>=1.0'), [
        { product: 'product', operator: '>=', value: '1.0' }
      ]);
    });
    it('should parse multiple products', () => {
      assert.deepEqual(parse('A<1.5+B>1.1'), [
        { product: 'A', operator: '<', value: '1.5' },
        { product: 'B', operator: '>', value: '1.1' },
      ]);
    });
    it('should throw syntax error', () => {
      assert.throws(() => parse('='), SyntaxError);
      assert.throws(() => parse('=1.0'), SyntaxError);
      assert.throws(() => parse('+'), SyntaxError);
      assert.throws(() => parse('=+='), SyntaxError);
      assert.throws(() => parse('product=1.0+=1.0'), SyntaxError);
    });
  });
});

