const {
  prepareTestEnv,
  clearTestEnv
} = require('../../test-utils.js')({ __dirname });

const __ = require('../../../src/lib.js');
const expectedNewDefaults = require('../../03.Defaults/expected-defaults.js');
const expectedNewConfig = require('./expected-new-config.js');
const expectedNewSchema = require('../../resources/with-actual-values/schema---av.js');

describe('Params: check after constructor call', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('Params');
  });

  test(`new defaults`, () => {
        expect(instance.defaults).toMatchObject(expectedNewDefaults);
  });

  test(`new config by _getValues`, () => {
    const config = instance._getValues();
        expect(config).toMatchObject(expectedNewConfig);
  });

    __.each(expectedNewConfig, (expectedValue, configName) => {
      test(`Check file "${configName}.json"`, () => {
        const config = instance._readNamedConfig(configName);
            expect(config).toMatchObject(expectedValue);
      });
    });

    test(`new schema`, () => {
        expect(instance.schema).toMatchObject(expectedNewSchema);
    });

    after(clearTestEnv);
});
