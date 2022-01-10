const {
  mkd,
  rm,
  clearTestEnv,
  cpSchemaCtx,
  niError,
  SCHEMA_DIR,
  Schema
} = require('../../test-utils.js')({ __dirname });

const configDir = Schema.getConfigDir();

describe('Schema: ERRORS: _reloadSchema()', () => {
  beforeAll(() => {
    const schemaDir = Schema.getSchemaDir();
    mkd(schemaDir);
    rm(`${schemaDir}/schema.js`);
    rm(configDir);
  });

  test('ERROR: Missing root configuration directory', () => {
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = './config/notExists';
    expect(niError('Schema')).toMatch(/Missing root configuration directory/);
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = SCHEMA_DIR;
  });

  test('ERROR: Missing Schema file', () => {
    expect(niError('Schema')).toMatch(/Missing Schema file .+schema.js/);
  });

  test('ERROR: Failed to load Schema', () => {
    cpSchemaCtx('./schema-bad.js.txt');
    expect(niError('Schema')).toMatch(/Failed to load Schema file .+schema.js/);
  });

  test('ERROR: Schema does not contain an array of schema items', () => {
    cpSchemaCtx('./schema-no-array.js.txt');
    expect(niError('Schema')).toMatch(/Schema .+ does not contain an array/);
  });

  test('ERROR: Schema contains no data', () => {
    cpSchemaCtx('./schema-empty.js.txt');
    expect(niError('Schema')).toMatch(/Schema .+ contains no data/);
  });

  after(clearTestEnv);
});
