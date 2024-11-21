const PgSaveService = require('./PgSaveService');
const FileSaveService = require('./FileSaveService');

function getConfigService (serviceOptions, schema) {
  const { saveTo, pgOptions } = serviceOptions;
  if (saveTo === 'postgres') {
    return new PgSaveService(pgOptions, schema);
  }
  return new FileSaveService();
}

module.exports = { getConfigService };
