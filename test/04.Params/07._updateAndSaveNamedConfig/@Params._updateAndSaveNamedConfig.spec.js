/* eslint-disable max-len */
const {
  prepareTestEnv,
  clearTestEnv,
  Params,
  clrRequire,

} = require('../../test-utils.js')({ __dirname });

const configName = 'config1';
const newConfig = require('./new-config1.js');

const configFile = `${Params.getConfigDir()}/${configName}.json`;
const expected = require('./expected-ansver-without-refresh-schema.js');
const expectedWithRefresh = require('./expected-ansver-with-refresh-schema.js');

describe('Params: _updateAndSaveNamedConfig()', () => {
  let instance;
  before(async () => {
    instance = prepareTestEnv('Params');
    await instance._updateAndSaveNamedConfig(configName, newConfig);
    // Значения, загруженные из предыдущего конфига, отсутствующие в новом, остаются, если флаг refreshSchema = false
  });

  it('_updateAndSaveNamedConfig(): Checking a new value in a configuration OBJECT (refreshSchema = false)', async () => {
    await instance._updateAndSaveNamedConfig(configName, newConfig, false);
    const config = instance._getValues();
    expect(config.config1).to.eql(expected);
  });

  it('_updateAndSaveNamedConfig(): Checking a new value in the configuration FILE', () => {
    clrRequire(configFile);
    // eslint-disable-next-line import/no-dynamic-require
    const content = require(configFile);
    expect(content).to.eql(expected);
  });

  it('_updateAndSaveNamedConfig(): Checking a new value in a configuration OBJECT (refreshSchema = true)', async () => {
    await instance._updateAndSaveNamedConfig(configName, newConfig, true);
    const config = instance._getValues();
    expect(config.config1).to.eql(expectedWithRefresh);
  });

  it('_updateAndSaveNamedConfig(): Checking a new value in the configuration FILE', () => {
    clrRequire(configFile);
    // eslint-disable-next-line import/no-dynamic-require
    const content = require(configFile);
    expect(content).to.eql(expectedWithRefresh);
  });

  after(clearTestEnv);
});
