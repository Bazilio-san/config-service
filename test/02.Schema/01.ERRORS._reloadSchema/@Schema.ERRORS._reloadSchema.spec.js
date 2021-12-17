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
  before(() => {
    const schemaDir = Schema.getSchemaDir();
    mkd(schemaDir);
    rm(`${schemaDir}/schema.js`);
    rm(configDir);
  });

  it('ERROR: Missing root configuration directory', () => {
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = './config/notExists';
    expect(niError('Schema')).to.match(/Missing root configuration directory/);
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = SCHEMA_DIR;
  });

  it('ERROR: Missing Schema file', () => {
    expect(niError('Schema')).to.match(/Missing Schema file .+schema.js/);
  });

  it('ERROR: Failed to load Schema', () => {
    cpSchemaCtx('./schema-bad.js.txt');
    expect(niError('Schema')).to.match(/Failed to load Schema file .+schema.js/);
  });

  it('ERROR: Schema does not contain an array of schema items', () => {
    cpSchemaCtx('./schema-no-array.js.txt');
    expect(niError('Schema')).to.match(/Schema .+ does not contain an array/);
  });

  it('ERROR: Schema contains no data', () => {
    cpSchemaCtx('./schema-empty.js.txt');
    expect(niError('Schema')).to.match(/Schema .+ contains no data/);
  });

  after(clearTestEnv);
});
