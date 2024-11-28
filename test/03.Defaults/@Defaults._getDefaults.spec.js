/* eslint-disable no-unused-expressions */

const {
  prepareTestEnv,
  clearTestEnv,
} = require('../test-utils.js')({ __dirname });

describe('Defaults: must be valid', () => {
  let instance;
  before(async () => {
    instance = await prepareTestEnv('Params');
  });
  it('defaults from instance._getDefaults()', () => {
    const expectedDefaults = require('./expected-defaults.js');
    expect(instance._getDefaults()).to.eql(expectedDefaults);
  });
  after(clearTestEnv);
});
