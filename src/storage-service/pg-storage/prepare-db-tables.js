const { isTableOrViewExistsPg, queryPg } = require('af-db-ts');
const { getConfigTableInitScript } = require('./init-config-service');
const { getConfigHistoryTableInitScript } = require('./init-config-service-history');
const { initLogger } = require('../../logger');

const logger = initLogger({ scope: 'prepareDbTables' });

const prepareDbTables = async (dbId, schema, configTableName, configHistoryTableName) => {
  try {
    const configTableEntity = `${schema}.${configTableName}`;
    const isConfigTableExist = await isTableOrViewExistsPg(dbId, configTableEntity);
    if (!isConfigTableExist) {
      const initScript = getConfigTableInitScript(schema, configTableName);
      await queryPg(dbId, initScript);
    }

    const configHistoryTableEntity = `${schema}.${configHistoryTableName}`;
    const isConfigHistoryTableExist = await isTableOrViewExistsPg(dbId, configHistoryTableEntity);
    if (!isConfigHistoryTableExist) {
      const initScript = getConfigHistoryTableInitScript(schema, configHistoryTableName);
      await queryPg(dbId, initScript);
    }
  } catch (error) {
    logger.error(`Error: `, error);
  }
};

module.exports = { prepareDbTables };
