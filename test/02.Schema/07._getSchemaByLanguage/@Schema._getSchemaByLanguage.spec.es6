const {
    prepareTestEnv,
    clearTestEnv
} = require('../../test-utils.es6')({ __dirname });

const expectedSchemaRu = require('./expected-schema-ru---default-values.es6');
const expectedSchemaEn = require('./expected-schema-en---default-values.es6');

describe('Translations should work properly', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('Schema');
    });

    it('Method _getSchemaByLanguage() should cache the correct translations (ru)', () => {
        const result = instance._getSchemaByLanguage('ru');
        expect(result).to.eql(expectedSchemaRu);
    });

    it('Method _getSchemaByLanguage() should cache the correct translations (en)', () => {
        const result = instance._getSchemaByLanguage('en');
        expect(result).to.eql(expectedSchemaEn);
    });

    it('No translation into a non-existent language', () => {
        const foo = instance._getSchemaByLanguage('foo');
        expect(foo).to.eql(instance.schema);
    });

    after(clearTestEnv);
});
