const {
  prepareTestEnv,
  clearTestEnv,
  niError,
} = require('../../test-utils.js')({ __dirname });

describe('Params: ERRORS: _parseParamPath()', () => {
  before(async () => {
    await prepareTestEnv(false);
  });

  [
    [null, null],
    ['str', null],
    [1, 2],
    1,
    true,
    { a: 1 },
  ].forEach((pathArr) => {
    it(`ERROR: Parameter name not passed to "${String(pathArr)}"`, async () => {
      const result = await niError('Params', '_parseParamPath', pathArr, { callFrom: 'fnFoo' });
      expect(result).to.have.string('Parameter path is not a string or array of strings');
    });
  });

  it('ERROR: No such parameter in the Schema:', async () => {
    const result = await niError('Params', '_parseParamPath', 'foo.param', { callFrom: 'foo' });
    expect(result).to.match(/No such parameter/);
  });

  after(clearTestEnv);
});
