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

describe('Schema: _reloadSchema()', () => {
  let instance;
  beforeAll(() => {
    prepareTestEnv(false);
    clrRequire(`${schemaDir}/schema.js`);
    cpc('./schema1.js', `${schemaDir}/schema.js`);
    instance = newInstance('Schema');
  });

  test('When reloading a modified Schema, changes should be visible', () => {
    expect(instance.schema.value[0].value[0].type).toMatchObject('string');
    cpc('./schema2.js', `${schemaDir}/schema.js`);
    instance._reloadSchema();
    expect(instance.schema.value[0].value[0].type).toMatchObject('array');
  });

  after(clearTestEnv);
});
