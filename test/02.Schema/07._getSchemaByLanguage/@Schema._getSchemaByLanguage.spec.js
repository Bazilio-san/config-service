const {
  prepareTestEnv,
  clearTestEnv,
  toPlainObj,
} = require('../../test-utils.js')({ __dirname });

const expectedSchemaRu = require('./expected-schema-ru---default-values.js');
const expectedSchemaEn = require('./expected-schema-en---default-values.js');

describe('Schema: Translations should work properly', () => {
  let instance;
  before(async () => {
    instance = await prepareTestEnv('Schema');
  });

  it('Method _getSchemaByLanguage() should cache the correct translations (ru)', () => {
    const result = instance._getSchemaByLanguage('ru');
    expect(toPlainObj(result)).to.eql(expectedSchemaRu);
  });

  it('Method _getSchemaByLanguage() should cache the correct translations (en)', () => {
    const result = instance._getSchemaByLanguage('en');
    expect(toPlainObj(result)).to.eql(expectedSchemaEn);
  });

  it('No translation into a non-existent language', () => {
    const foo = instance._getSchemaByLanguage('foo');
    expect(foo).to.eql(instance.schema);
  });

  after(clearTestEnv);
});
