const {
    prepareTestEnv,
    clearTestEnv,
    niError,
    cpSchemaFromResources

} = require('../../test-utils.es6')({ __dirname });

describe('Params: ERRORS: _parseParamPath()', () => {
    before(() => {
        prepareTestEnv(false);
    });

    [
        [null, null],
        ['str', null],
        [1, 2],
        1,
        true,
        { a: 1 },
    ].forEach((pathArr) => {
        it(`ERROR: Parameter name not passed to "${String(pathArr)}"`, () => {
            expect(niError('Params', '_parseParamPath', pathArr, 'fnFoo'))
                .to.have.string('Parameter path is not a string or array of strings');
        });
    });

    it('ERROR: No such parameter in the Schema:', () => {
        expect(niError('Params', '_parseParamPath', 'foo.param', 'foo'))
            .to.match(/No such parameter/);
    });

    after(clearTestEnv);
});
