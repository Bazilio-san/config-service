/* eslint-disable no-unused-expressions */

const {
  prepareTestEnv,
  clearTestEnv
} = require('../test-utils.js')({ __dirname });

describe('Defaults: must be valid', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('Params');
  });
  test('defaults from instance.defaults', () => {
    const expectedDefaults = require('./expected-defaults.js');
        expect(instance._getDefaults()).toMatchObject(expectedDefaults);
  });

  test('defaults from instance._getDefaults()', () => {
    const expectedDefaults = require('./expected-defaults.js');
        expect(instance._getDefaults()).toMatchObject(expectedDefaults);
  });
  after(clearTestEnv);
});
