const {
  mkd,
  rm,
  clearTestEnv,
  cpSchemaCtx,
  niError,
  fnError,
  Schema,
  prepareTestEnv
} = require('../../test-utils.js')({ __dirname });

const configDir = Schema.getConfigDir();

describe('Schema: ERRORS: _validateSchemaItem()', () => {
  beforeAll(() => {
    const schemaDir = Schema.getSchemaDir();
    mkd(schemaDir);
    rm(configDir);
    rm(`${schemaDir}/schema.js`);
  });

  test('ERROR: Parameter ID not specified', () => {
    cpSchemaCtx('./schema-no-id.js');
    expect(niError('Schema')).to.have.string('Parameter ID not specified for');
  });

  test('ERROR: Parameter type not specified', () => {
    cpSchemaCtx('./schema-no-type.js');
    expect(niError('Schema')).to.have.string('Parameter type not specified for');
  });

  test('ERROR: Invalid type for parameter', () => {
    cpSchemaCtx('./schema-bad-type.js');
    expect(niError('Schema')).toMatch(/Invalid type .+ for parameter/);
  });

  test('ERROR: The real type does not match (1)', () => {
    cpSchemaCtx('./schema-section-not-is-array.js');
    expect(niError('Schema')).toMatch(/The real type .+ of value for param .+ found in Schema does not match/);
  });

  test('ERROR: The real type does not match (2)', () => {
    cpSchemaCtx('./schema-real-type-not-match.js');
    expect(niError('Schema')).toMatch(/The real type .+ of value for param .+ found in Schema does not match/);
  });

  test('ERROR: Invalid type', () => {
    const instance = prepareTestEnv('Schema');
    instance.schema.value[0].value[0].type = 'foo';
    expect(fnError(instance, '_validateSchemaItem', instance.schema.value[0].value[0], ['config1', 'div10']))
      .to.match(/Invalid type/);
  });

  after(clearTestEnv);
});
