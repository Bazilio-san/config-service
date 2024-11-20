const PgSaveService = require('./PgSaveService');
const FileSaveService = require('./FileSaveService');

function getConfigService (serviceOptions) {
  const { saveTo, pgOptions } = serviceOptions;
  if (saveTo === 'postgres') {
    return new PgSaveService(pgOptions);
  }
  return new FileSaveService();
}

module.exports = { getConfigService };
