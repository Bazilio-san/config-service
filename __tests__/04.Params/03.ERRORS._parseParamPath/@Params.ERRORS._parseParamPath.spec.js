const {
  prepareTestEnv,
  clearTestEnv,
  niError

} = require('../../test-utils.js')({ __dirname });

describe('Params: ERRORS: _parseParamPath()', () => {
  beforeAll(() => {
    prepareTestEnv(false);
  });

    [
      [null, null],
      ['str', null],
      [1, 2],
      1,
      true,
      { a: 1 }
    ].forEach((pathArr) => {
      test(`ERROR: Parameter name not passed to "${String(pathArr)}"`, () => {
            expect(niError('Params', '_parseParamPath', pathArr, { callFrom: 'fnFoo' }))
                .to.have.string('Parameter path is not a string or array of strings');
      });
    });

    test('ERROR: No such parameter in the Schema:', () => {
        expect(niError('Params', '_parseParamPath', 'foo.param', { callFrom: 'foo' }))
            .to.match(/No such parameter/);
    });

    after(clearTestEnv);
});
