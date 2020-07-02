const Utils = require('../../src/Utils.es6');

const instance = new Utils();

const { clrRequire, pr, fnError } = require('../test-utils.es6')({ __dirname });

clrRequire(pr('./in_obj.js'));
clrRequire(pr('./obj_without_undefined.js'));

const inObj = require('./in_obj.es6');
const objWoUndef = require('./obj_without_undefined.es6');

describe('Utils: _normalizeJSON()', () => {
    it('Undefined property should be excluded; undefined array items -> null', () => {
        expect(instance._normalizeJSON({
            a: undefined,
            b: [undefined]
        })).to.eql({ b: [null] });
    });

    it('Test normalize json', () => {
        expect(instance._normalizeJSON(inObj)).to.eql(objWoUndef);
    });

    it('ERROR: Cannot normalize JSON value', () => {
        inObj.obj.self = inObj;
        expect(fnError(instance, '_normalizeJSON', inObj)).to.match(/Cannot normalize JSON value/);
    });
});
