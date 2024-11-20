const {
  mkd,
  rm,
  clearTestEnv,
  cpSchemaCtx,
  niError,
  SCHEMA_DIR,
  Schema,
} = require('../../test-utils.js')({ __dirname });

const configDir = Schema.getConfigDir();

describe('Schema: ERRORS: reloadSchema()', () => {
  before(() => {
    const schemaDir = Schema.getSchemaDir();
    mkd(schemaDir);
    rm(`${schemaDir}/schema.js`);
    rm(configDir);
  });

  it('ERROR: Missing root configuration directory', async () => {
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = './config/notExists';
    const result = await niError('Schema');
    expect(result).to.match(/Missing root configuration directory/);
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = SCHEMA_DIR;
  });

  it('ERROR: Missing Schema file', async () => {
    const result = await niError('Schema');
    expect(result).to.match(/Missing Schema file .+schema.js/);
  });

  it('ERROR: Failed to load Schema', async () => {
    cpSchemaCtx('./schema-bad.js.txt');
    const result = await niError('Schema');
    expect(result).to.match(/Failed to load Schema file .+schema.js/);
  });

  it('ERROR: Schema does not contain an array of schema items', async () => {
    cpSchemaCtx('./schema-no-array.js.txt');
    const result = await niError('Schema');
    expect(result).to.match(/Schema .+ does not contain an array/);
  });

  it('ERROR: Schema contains no data', async () => {
    cpSchemaCtx('./schema-empty.js.txt');
    const result = await niError('Schema');
    expect(result).to.match(/Schema .+ contains no data/);
  });

  after(clearTestEnv);
});
