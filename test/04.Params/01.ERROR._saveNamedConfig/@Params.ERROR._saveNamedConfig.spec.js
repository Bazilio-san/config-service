const {
  prepareTestEnv,
  clearTestEnv,
  niError
} = require('../../test-utils.js')({ __dirname });

describe('Params: _saveNamedConfig()', () => {
  before(async () => {
    await prepareTestEnv('Params');
  });

  it('ERROR: The configuration is not in memory', async () => {
    const result = await niError('Params', '_saveNamedConfig', 'foo');
    expect(result).to.match(/No such parameter/);
  });

  after(clearTestEnv);
});
