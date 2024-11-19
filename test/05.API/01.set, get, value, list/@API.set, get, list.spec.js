/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */

const lib = require('../../../src/lib.js');
const {
  prepareTestEnv,
  clearTestEnv,
  fnError,
  niError
} = require('../../test-utils.js')({ __dirname });

const expected = require('../../resources/with-actual-values/expected-config--get.js');

const newValues = [
  [['config1', 'div13', 'v_email'], 'new.value-of@email-1230000000000.test.com', 'new.value-of@email-123.test.com'],
  ['config1.div13.v_email', 'new.value-of@email-123.test.com'],
  ['config1.div13.v_json', { a: 1 }],
  ['config-2.div21', [{ f: 2 }, { g: 3 }]],
  ['config 3.div31', null],
  ['config1.div10', '!!!НОВАЯ СТРОКА!!!']
];
const unchangedValues = [
  [null, expected],
  [undefined, expected],
  ['', expected],
  [[], expected],
  ['config1', expected.config1],
  ['config-2.div22', [10, 20, 30]],
  [['config-2', 'div22'], [10, 20, 30]],
  ['config1.div13.v_int', 456],
  ['config1.div13.v_datetime', '2020-02-28T11:12:13.456'],
  ['config1.div13.v_float', 456.7890123]
];

describe('API: set(), get(), getEx(), list()', () => {
  let instance;
  before(async () => {
    instance = await prepareTestEnv('API');
    newValues.forEach(([paramPath, newVal]) => {
      instance.set(paramPath, newVal);
    });
  });

  it('After set(): check new value in a configuration object', () => {
    const config = instance._getValues();
    expect(config).to.eql(expected);
  });

  describe('Check new values by get():', () => {
    lib.each(expected, (configExpected, configName) => {
      it(`Named config: "${configName}"`, () => {
        const paramValue = instance.get(configName);
        expect(paramValue).to.eql(configExpected);
      });
    });
    [...newValues, ...unchangedValues].forEach(([paramPath, expectedValue, overwrittenValue]) => {
      it(`get(): path: "${paramPath}"`, () => {
        const paramValue = instance.get(paramPath);
        expect(paramValue).to.eql(overwrittenValue || expectedValue);
      });
    });
    it('Method getEx() should return the correct value', async () => {
      const configName = 'config1';
      const newConfig = require('../../04.Params/07._updateAndSaveNamedConfig/new-config1.js');
      await instance._updateAndSaveNamedConfig(configName, newConfig);
      const content = instance.getEx('config1');
      const expected2 = require('./expected-ansver1.js');
      expect(content).to.eql(expected2);
    });
  });

  describe('ERRORS: set', () => {
    [
      ['config1', 99999]
    ].forEach(([path, value]) => {
      it(`ERROR: Cannot set a value for a 'section': '${path}' <- ${value}`, async () => {
        const result = await niError('API', 'set', path, value);
        expect(result).to.match(/Cannot set a value .+ for a 'section'/);
      });
    });

    [
      ['config1.div13.v_email', 99999]
    ].forEach(([path, value]) => {
      it(`ERROR: Invalid type of param: '${path}' <- ${value}`, async () => {
        const result = await niError('API', 'set', path, value);
        expect(result).to.match(/The real type .+ of value for .+ not match schema data type/);
      });
    });

    [
      ['config1.div13.v_email', '99999']
    ].forEach(([path, v]) => {
      it(`ERROR: Parameter could not be normalized: '${path}' <- ${typeof v === 'number' ? v : `'${v}'`}`, async () => {
        const result = await niError('API', 'set', path, v);
        expect(result).to.match(/Validation error/);
      });
    });

    it('ERROR: The path must begin with a named configuration identifier', () => {
      expect(fnError(instance, 'set', '', 'text'))
        .to.match(/The path must begin with a named configuration identifier/);
    });

    it('ERROR: There is no such named configuration in the schema', () => {
      expect(fnError(instance, 'set', 'config_foo', 'text'))
        .to.match(/There is no named configuration .+ in the schema/);
    });

    it('ERROR: There is no such named configuration in the schema', () => {
      expect(fnError(instance, 'set', 'foo.bar', 'text'))
        .to.match(/There is no named configuration .+ in the schema/);
    });

    it('ERROR: No such parameter in the Schema', () => {
      expect(fnError(instance, 'set', 'config1.div11.div21.div31.foo', 'text'))
        .to.match(/No such parameter/);
    });

    it('ERROR: No such parameter in the Schema', () => {
      const paramPath = 'config1.div13.v_email';
      instance.set(paramPath, 'validateNewValueIsOK@test.com');
      expect(fnError(instance, 'set', paramPath, 'invalid@email'))
        .to.match(/Validation error of value for/);
    });

    it(`If the value is set incorrectly, the old value should remain`, () => {
      expect(instance.get('config1.div13.v_email', { callFrom: 'test' }))
        .equals('validateNewValueIsOK@test.com');
    });
  });

  describe('ERRORS: get():', () => {
    it('ERROR: No such parameter in the Schema...', () => {
      expect(fnError(instance, 'get', 'config1.div11.divfoo'))
        .to.match(/No such parameter/);
    });
    it('ERROR: No such parameter in the Schema...', () => {
      expect(fnError(instance, 'get', 'config_foo'))
        .to.match(/No such parameter/);
    });
  });

  describe('Check list():', () => {
    it('list should return list of configNames', () => {
      expect(instance.list()).to.eql(['config1', 'config-2', 'config 3']);
    });
  });

  after(clearTestEnv);
});
