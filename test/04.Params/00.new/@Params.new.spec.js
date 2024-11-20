const {
  prepareTestEnv,
  clearTestEnv,
  toPlainObj,
} = require('../../test-utils.js')({ __dirname });

const __ = require('../../../src/lib.js');
const expectedNewDefaults = require('../../03.Defaults/expected-defaults.js');
const expectedNewConfig = require('./expected-new-config.js');
const expectedNewSchema = require('../../resources/with-actual-values/schema---av.js');

describe('Params: check after constructor call', () => {
  let instance;
  before(async () => {
    instance = await prepareTestEnv('Params');
  });

  it(`new defaults`, () => {
    expect(instance.defaults).to.eql(expectedNewDefaults);
  });

  it(`new config by _getValues`, () => {
    const config = instance._getValues();
    expect(config).to.eql(expectedNewConfig);
  });

  __.each(expectedNewConfig, (expectedValue, configName) => {
    it(`Check file "${configName}.json"`, () => {
      const config = instance._readNamedConfig(configName);
      expect(config).to.eql(expectedValue);
    });
  });

  it(`new schema`, () => {
    expect(toPlainObj(instance.schema)).to.eql(expectedNewSchema);
  });

  after(clearTestEnv);
});
