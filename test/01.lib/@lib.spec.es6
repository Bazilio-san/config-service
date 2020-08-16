const lib = require('../../src/lib.es6');

const inObj = require('./in_obj.es6');
const objWoUndef = require('./obj_without_undefined.es6');
const fullCopy = require('./obj_full_copy.es6');

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

const { prepareTestEnv } = require('../test-utils.es6')({ __dirname });

describe('Lib functions should work properly', () => {
    describe('Function "cloneDeep()"', () => {
        before(() => {
            instance = prepareTestEnv('Schema');
            cloned = lib.cloneDeep(inObj);
        });
        it('in !== out', () => {
            expect(cloned).to.not.equal(fullCopy);
        });
        it('Deep equal', () => {
            expect(cloned).to.eql(fullCopy);
        });
        it('Remove certain properties', () => {
            const expected = instance.cloneDeep(inObj);
            const result = instance.cloneDeep(inObj, ['a', 'flo']);
            delete expected.arr[0].a;
            delete expected.obj.a;
            delete expected.flo;
            expect(result).to.eql(expected);
        });
        it('Verify copy symbol properties', () => {
            expect(cloned.obj[symbolProp]).to.equals(fullCopy.obj[symbolProp]);
        });
        it('Changes in the properties of inner objects of copy are absent in the original', () => {
            fullCopy.arr[0].s0 = 'new';
            fullCopy.obj.new = 'new';
            expect(inObj.arr[0].s0).to.equals('');
            expect(inObj.obj.new).to.equals(undefined);
        });
    });

    describe('Function "cloneDeepWithoutUndefined()"', () => {
        before(() => {
            cloned = lib.cloneDeepWithoutUndefined(inObj);
        });
        it('in !== out', () => {
            expect(cloned).to.not.equal(objWoUndef);
        });
        it('Deep equal to object without undefined props', () => {
            expect(cloned).to.eql(objWoUndef);
        });
        it('Verify copy symbol properties', () => {
            expect(cloned.obj[symbolProp]).to.equals(objWoUndef.obj[symbolProp]);
        });
        it('Changes in the properties of inner objects of copy are absent in the original', () => {
            objWoUndef.arr[0].s0 = 'new';
            objWoUndef.obj.new = 'new';
            expect(inObj.arr[0].s0).to.equals('');
            expect(inObj.obj.new).to.equals(undefined);
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
            it(String(value), () => {
                expect(lib.isObject(value)).to.equal(expected);
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
            it(`${value}`, () => {
                expect(lib.isNonEmptyObject(value)).to.equal(expected);
            });
        });
    });
});
