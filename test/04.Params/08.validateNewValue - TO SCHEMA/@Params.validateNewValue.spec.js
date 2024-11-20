/* eslint-disable no-unused-expressions */

const {
  prepareTestEnv,
  clearTestEnv,
  fnError,
} = require('../../test-utils.js')({ __dirname });

function functionFoo () {
}

const reErrorRealType = /The real type .+ not match schema data type/;
const reErrorSection = /Cannot set a value for a 'section'/;
const reValidationError = /Validation error of value for/;

describe('Params: validateNewValue()', () => {
  let instance;

  function getSchemaItem (paramPath) {
    const pathArr = paramPath.split('.');
    return instance._getSchemaFragment(pathArr, null, { callFrom: 'test' });
  }

  function vnv (paramPath, value) {
    return instance.validateNewValue(value, getSchemaItem(paramPath));
  }

  before(async () => {
    instance = await prepareTestEnv('Params');
  });

  it('For null values - "true"', () => {
    expect(vnv('config1.div13.v_json', null)).equals(null);
  });

  [

    ['json', { b: 1 }],
    ['json', 1],
    ['json', [1, 3]],
    ['json', 'dddd'],
    ['json', true],
    ['array', [1, 2]],
    ['string', 'sssss'],
    ['string', { a: 1 }, '{"a":1}'],
    ['string', 99, '99'],
    ['string', true, 'true'],
    ['string', false, 'false'],
    ['text', 'tttt'],
    ['text', ['arr'], reErrorRealType],
    ['date', '2020-04-04'],
    ['time', '10:30:01.456'],
    ['datetime', '2020-04-04 10:30:01.456', '2020-04-04T10:30:01.456'],
    ['email', 'validateNewValueIsOK@test.com'],
    ['number', 123],
    ['int', 345],
    ['float', 567.89],
    ['money', 567.89],
    ['boolean', true],
    //
    ['section_empty', [1, 2], reErrorSection],
    ['section_empty', 'ssss', reErrorRealType],
    ['section_empty', [], reErrorSection],
    ['section_empty', { a: 0, c: 3 }, reErrorSection],
    ['section_empty', {}, reErrorSection],

    ['json', functionFoo, reErrorRealType],
    ['array', 1, reErrorRealType],
    ['date', 2, reErrorRealType],
    ['date', '2020-99-99', reValidationError],
    ['time', true, reErrorRealType],
    ['time', '25-12-12', reValidationError],
    ['datetime', ['arr'], reErrorRealType],
    ['datetime', '2020-99-99', reValidationError],
    ['email', 2, reErrorRealType],
    ['email', 'eeee@mail', reValidationError],
    ['number', 'number', /Failed to convert string to number/],
    ['int', {}, reErrorRealType],
    ['float', ['555'], reErrorRealType],
    ['money', 'str', /Failed to convert string to number/],
    ['boolean', [], reErrorRealType],
  ].forEach(([schemaDataType, value, expected]) => {
    if (expected === undefined) {
      expected = value;
    }
    it(`${schemaDataType} -> ${value} -> ${expected}`, () => {
      const paramPath = `config1.div13.v_${schemaDataType}`;
      if (expected instanceof RegExp) {
        const schemaItem = getSchemaItem(paramPath);
        expect(fnError(instance, 'validateNewValue', value, schemaItem))
          .to.match(expected);
      } else {
        expect(vnv(paramPath, value)).eql(expected);
      }
    });
  });

  it(`ERROR: Validator function not found for type`, () => {
    delete instance.types.string.validator;
    const schemaItem = getSchemaItem(`config1.div13.v_string`);
    expect(fnError(instance, 'validateNewValue', 'sssss', schemaItem))
      .to.match(/Validator function not found for type/);
  });

  after(clearTestEnv);
});
