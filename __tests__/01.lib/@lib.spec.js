const lib = require('../../src/lib');

const inObj = require('./in_obj.js');
const objWoUndef = require('./obj_without_undefined.js');
const fullCopy = require('./obj_full_copy.js');

const symbolProp = Symbol.for('symbolProp');

inObj[symbolProp] = 'testSymbolProp';
inObj.arr.push(symbolProp);
inObj.obj[symbolProp] = 'testSymbolProp';

fullCopy[symbolProp] = 'testSymbolProp';
fullCopy.arr.push(symbolProp);
fullCopy.obj[symbolProp] = 'testSymbolProp';

objWoUndef[symbolProp] = 'testSymbolProp';
objWoUndef.arr.push(symbolProp);
objWoUndef.obj[symbolProp] = 'testSymbolProp';

let cloned;
let instance;

const { prepareTestEnv } = require('../test-utils.js')({ __dirname });

describe.only('Lib: functions should work properly', () => {
  describe('Function "cloneDeep()"', () => {
    beforeAll(() => {
      instance = prepareTestEnv('Schema');
      cloned = lib.cloneDeep(inObj);
    });
    test('in !== out', () => {
      expect(cloned).to.not.equal(fullCopy);
    });
    test('Deep equal', () => {
      expect(cloned).toMatchObject(fullCopy);
    });
    test('Remove certain properties', () => {
      const expected = instance.cloneDeep(inObj);
      const result = instance.cloneDeep(inObj, { removeProps: ['a', 'flo'] });
      delete expected.arr[0].a;
      delete expected.obj.a;
      delete expected.flo;
      expect(result).toMatchObject(expected);
    });
    test('Verify copy symbol properties', () => {
      expect(cloned.obj[symbolProp]).toEqual(fullCopy.obj[symbolProp]);
    });
    test('Remove symbol properties', () => {
      const result = instance.cloneDeep(inObj, { removeSymbols: true });
      expect(result[symbolProp]).toEqual(undefined);
      expect(result.obj[symbolProp]).toEqual(undefined);
      expect(result.arr.findIndex((v) => symbolProp === v)).gte(-1);
    });
    test('Remove object constructors (pureObj)', () => {
      const result = instance.cloneDeep(inObj, { pureObj: true });
      expect(result.obj.constructor).toEqual(undefined);
    });
    test('Changes in the properties of inner objects of copy are absent in the original', () => {
      fullCopy.arr[0].s0 = 'new';
      fullCopy.obj.new = 'new';
      expect(inObj.arr[0].s0).toEqual('');
      expect(inObj.obj.new).toEqual(undefined);
    });
  });

  describe('Function "cloneDeepWithoutUndefined()"', () => {
    beforeAll(() => {
      cloned = lib.cloneDeepWithoutUndefined(inObj);
    });
    test('in !== out', () => {
      expect(cloned).to.not.equal(objWoUndef);
    });
    test('Deep equal to object without undefined props', () => {
      expect(cloned).toMatchObject(objWoUndef);
    });
    test('Verify copy symbol properties', () => {
      expect(cloned.obj[symbolProp]).toEqual(objWoUndef.obj[symbolProp]);
    });
    test('Changes in the properties of inner objects of copy are absent in the original', () => {
      objWoUndef.arr[0].s0 = 'new';
      objWoUndef.obj.new = 'new';
      expect(inObj.arr[0].s0).toEqual('');
      expect(inObj.obj.new).toEqual(undefined);
    });
  });

  describe('Function "isObject()"', () => {
    [
      [{}, true],
      [{ a: 1 }, true],

      [null, false],
      [undefined, false],
      ['', false],
      ['string', false],
      [0, false],
      [123, false],
      [-123, false],
      [true, false],
      [false, false],
      [[], false],
      [[1, 2], false],
      [new Date(), false],
      [new Set(), false],
      [new Map(), false],
      [NaN, false],
      [Infinity, false],
    ].forEach(([value, expected]) => {
      test(String(value), () => {
        expect(lib.isObject(value)).toEqual(expected);
      });
    });
  });

  describe('Function "isNonEmptyObject()"', () => {
    [
      [{ a: 1 }, true],

      [{}, false],

      [null, false],
      [undefined, false],
      ['', false],
      ['string', false],
      [0, false],
      [123, false],
      [-123, false],
      [true, false],
      [false, false],
      [[], false],
      [[1, 2], false],
      [new Date(), false],
      [new Set(), false],
      [new Map(), false],
      [NaN, false],
      [Infinity, false],
    ].forEach(([value, expected]) => {
      test(`${value}`, () => {
        expect(lib.isNonEmptyObject(value)).toEqual(expected);
      });
    });
  });
});
