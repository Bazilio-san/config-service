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

describe('Schema: reloadSchema()', () => {
  let instance;
  before(() => {
    prepareTestEnv(false);
    clrRequire(`${schemaDir}/schema.js`);
    cpc('./schema1.js', `${schemaDir}/schema.js`);
    instance = newInstance('Schema');
  });

  it('When reloading a modified Schema, changes should be visible', async () => {
    expect(instance.schema.value[0].value[0].type).to.eql('string');
    cpc('./schema2.js', `${schemaDir}/schema.js`);
    await instance.reloadSchema();
    expect(instance.schema.value[0].value[0].type).to.eql('array');
  });

  after(clearTestEnv);
});
