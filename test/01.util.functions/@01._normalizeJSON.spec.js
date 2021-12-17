const Utils = require('../../src/Utils.js');

const instance = new Utils();

const { clrRequire, pr, fnError } = require('../test-utils.js')({ __dirname });

clrRequire(pr('./in_obj.js'));
clrRequire(pr('./obj_without_undefined.js'));

const inObj = require('./in_obj.js');
const objWoUndef = require('./obj_without_undefined.js');

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
