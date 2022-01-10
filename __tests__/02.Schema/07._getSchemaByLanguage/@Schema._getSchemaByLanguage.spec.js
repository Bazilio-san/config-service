const {
  prepareTestEnv,
  clearTestEnv
} = require('../../test-utils.js')({ __dirname });

const expectedSchemaRu = require('./expected-schema-ru---default-values.js');
const expectedSchemaEn = require('./expected-schema-en---default-values.js');

describe('Schema: Translations should work properly', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('Schema');
  });

  test('Method _getSchemaByLanguage() should cache the correct translations (ru)', () => {
    const result = instance._getSchemaByLanguage('ru');
    expect(result).toMatchObject(expectedSchemaRu);
  });

  test('Method _getSchemaByLanguage() should cache the correct translations (en)', () => {
    const result = instance._getSchemaByLanguage('en');
    expect(result).toMatchObject(expectedSchemaEn);
  });

  test('No translation into a non-existent language', () => {
    const foo = instance._getSchemaByLanguage('foo');
    expect(foo).toMatchObject(instance.schema);
  });

  after(clearTestEnv);
});
