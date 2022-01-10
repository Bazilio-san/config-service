/* eslint-disable no-unused-expressions */
const {
  Schema,
  cpc,
  prepareTestEnv,
  clearTestEnv,
  clrRequire,
  newInstance
} = require('../../test-utils.js')({ __dirname });

const schemaDir = Schema.getSchemaDir();

describe('Schema: _normalizeNewSchema()', () => {
  let instance;
  beforeAll(() => {
    prepareTestEnv(false);
    clrRequire(`${schemaDir}/schema.js`);
    cpc('./schema-no-default-properties.js', `${schemaDir}/schema.js`);
    instance = newInstance('Schema');
  });

  test('Missing optional properties should be added', () => {
    expect(instance.schema.value[0]).toMatchObject({
      id: 'rule1',
      path: 'rule1',
      title: 'Title of rule1',
      t: 'cs:rule1.title',
      type: 'section',
      value: []
    });
  });

  test('Check full normalized schema', () => {
    clrRequire(`${schemaDir}/schema.js`);
    const originalSchema = require('../../resources/schema.js');
    const expected = require('./schema-normalized---default-values.js');
    const normalizeFullSchema = instance._normalizeNewSchema(originalSchema);
    expect(normalizeFullSchema).toMatchObject(expected);
  });

  after(clearTestEnv);
});
