const { assert, expect } = require('chai');
const { range, isDate, uniqDate, join, cloneDate, firstDay, nextMonth } = require('../lib/util');

describe('util', () => {
  describe('range', () => {
    it('should return array which has 3 children', () => {
      expect(range(2)).to.have.lengthOf(3);
    });
  });
  describe('isDate', () => {
    it('should be date', () => {
      expect(isDate(new Date())).to.be.true;
    });
    it('should not be date', () => {
      expect(isDate('2022-01-01')).to.be.false;
    });
  });
  describe('uniqDate', () => {
    it('should returns uniq dates', () => {
      const date = new Date();
      const a = date.getTime();
      const b = date.getTime() + 100;
      const c = date.getTime() - 100;
      assert.deepEqual(uniqDate([
        new Date(a),
        new Date(b),
        new Date(b),
        new Date(c),
        new Date(c),
        new Date(c),
      ]), [new Date(a), new Date(b), new Date(c)]);
    });
  });
  describe('join', () => {
    it('should returns joined strings', () => {
      const ary = [1, 2, 2, 3, 3, 3];
      assert.equal(join(ary), '122333');
    });
  });
  describe('cloneDate', () => {
    it('should equal to cloned date', () => {
      const date = new Date();
      assert.deepEqual(cloneDate(date), date);
    });
  });
  describe('firstDay', () => {
    it('should equal to first day', () => {
      const date = new Date();
      date.setDate(1);
      assert.deepEqual(firstDay(new Date()).toDateString(), date.toDateString());
    });
  });
  describe('nextMonth', () => {
    it('should equal to next month', () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      assert.deepEqual(nextMonth(new Date()).toDateString(), date.toDateString());
    });
  });
});
