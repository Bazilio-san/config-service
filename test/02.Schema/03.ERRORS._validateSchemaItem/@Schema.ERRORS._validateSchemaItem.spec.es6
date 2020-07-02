const {
    mkd,
    rm,
    clearTestEnv,
    cpSchemaCtx,
    niError,
    fnError,
    Schema,
    prepareTestEnv
} = require('../../test-utils.es6')({ __dirname });

const configDir = Schema.getConfigDir();

describe('Schema: ERRORS: _validateSchemaItem()', () => {
    before(() => {
        const schemaDir = Schema.getSchemaDir();
        mkd(schemaDir);
        rm(configDir);
        rm(`${schemaDir}/schema.js`);
    });

    it('ERROR: Parameter ID not specified', () => {
        cpSchemaCtx('./schema-no-id.es6');
        expect(niError('Schema')).to.have.string('Parameter ID not specified for');
    });

    it('ERROR: Parameter type not specified', () => {
        cpSchemaCtx('./schema-no-type.es6');
        expect(niError('Schema')).to.have.string('Parameter type not specified for');
    });

    it('ERROR: Invalid type for parameter', () => {
        cpSchemaCtx('./schema-bad-type.es6');
        expect(niError('Schema')).to.match(/Invalid type .+ for parameter/);
    });

    it('ERROR: The real type does not match (1)', () => {
        cpSchemaCtx('./schema-section-not-is-array.es6');
        expect(niError('Schema')).to.match(/The real type .+ of value for param .+ found in Schema does not match/);
    });

    it('ERROR: The real type does not match (2)', () => {
        cpSchemaCtx('./schema-real-type-not-match.es6');
        expect(niError('Schema')).to.match(/The real type .+ of value for param .+ found in Schema does not match/);
    });

    it('ERROR: Invalid type', () => {
        const instance = prepareTestEnv('Schema');
        instance.schema.value[0].value[0].type = 'foo';
        expect(fnError(instance, '_validateSchemaItem', instance.schema.value[0].value[0], ['config1', 'div10']))
            .to.match(/Invalid type/);
    });

    after(clearTestEnv);
});
