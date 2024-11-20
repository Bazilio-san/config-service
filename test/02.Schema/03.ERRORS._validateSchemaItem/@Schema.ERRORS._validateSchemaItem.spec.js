const {
  mkd,
  rm,
  clearTestEnv,
  cpSchemaCtx,
  niError,
  fnError,
  Schema,
  prepareTestEnv,
} = require('../../test-utils.js')({ __dirname });

const configDir = Schema.getConfigDir();

describe('Schema: ERRORS: _validateSchemaItem()', () => {
  before(() => {
    const schemaDir = Schema.getSchemaDir();
    mkd(schemaDir);
    rm(configDir);
    rm(`${schemaDir}/schema.js`);
  });

  it('ERROR: Parameter ID not specified', async () => {
    cpSchemaCtx('./schema-no-id.js');
    const result = await niError('Schema');
    expect(result).to.have.string('Parameter ID not specified for');
  });

  it('ERROR: Parameter type not specified', async () => {
    cpSchemaCtx('./schema-no-type.js');
    const result = await niError('Schema');
    expect(result).to.have.string('Parameter type not specified for');
  });

  it('ERROR: Invalid type for parameter', async () => {
    cpSchemaCtx('./schema-bad-type.js');
    const result = await niError('Schema');
    expect(result).to.match(/Invalid type .+ for parameter/);
  });

  it('ERROR: The real type does not match (1)', async () => {
    cpSchemaCtx('./schema-section-not-is-array.js');
    const result = await niError('Schema');
    expect(result).to.match(/The real type .+ of value for param .+ found in Schema does not match/);
  });

  it('ERROR: The real type does not match (2)', async () => {
    cpSchemaCtx('./schema-real-type-not-match.js');
    const result = await niError('Schema');
    expect(result).to.match(/The real type .+ of value for param .+ found in Schema does not match/);
  });

  it('ERROR: Invalid type', async () => {
    const instance = await prepareTestEnv('Schema');
    instance.schema.value[0].value[0].type = 'foo';
    expect(fnError(instance, '_validateSchemaItem', instance.schema.value[0].value[0], ['config1', 'div10']))
      .to.match(/Invalid type/);
  });

  after(clearTestEnv);
});
