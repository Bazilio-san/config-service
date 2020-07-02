const {
    cpc,
    rm,
    clearTestEnv,
    cpSchemaFromResources,
    niError,
    Params
} = require('../../test-utils.es6')({ __dirname });

const configDir = Params.getConfigDir();

describe('Params: INIT ERRORS', () => {
    describe('Configuration file errors', () => {
        before(() => {
            clearTestEnv();
            cpSchemaFromResources('schema.es6');
        });

        it('ERROR: Missing configuration directory', () => {
            expect(niError('Params')).to.have.string('Missing configuration directory');
        });

        it('ERROR: The expected configuration directory is a file', () => {
            cpc('./testing', configDir);
            expect(niError('Params')).to.have.string('The expected configuration directory is a file');
            rm(configDir);
        });

        after(clearTestEnv);
    });
});
