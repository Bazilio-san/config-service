const {
  prepareTestEnv,
  clearTestEnv,
  niError
} = require('../../test-utils.js')({ __dirname });

describe('Params: _saveNamedConfig()', () => {
  before(() => {
    prepareTestEnv('Params');
  });

  it('ERROR: The configuration is not in memory', () => {
        expect(niError('Params', '_saveNamedConfig', 'foo'))
            .to.match(/No such parameter/);
  });

  after(clearTestEnv);
});
