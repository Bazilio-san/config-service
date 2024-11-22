const { Pool } = require('pg');
const { prepareSqlValuePg } = require('af-db-ts');
const SaveService = require('./SaveService');
const { TABLE_NAME, defaultOptions } = require('./db-storage/pg-service-config.js');
const ee = require('../ee');
const { UPDATE_TIME } = require('./db-storage/pg-service-config');
const { initLogger } = require('../logger');

/**
 * Класс отвечает за запись и чтение данных из базы дынных.
 */
module.exports = class PgSaveService extends SaveService {
  constructor (options, schema) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.updates = { schedule: {} };
    this.schema = schema;
    this.configRows = new Map();
    this.logger = initLogger({ scope: 'PgSaveService' });
    this.config = this._fetchFullConfig(this.schema);
  }

  /**
   * Get config by configName
   *
   * @param {string} configName
   */
  async getConfig (configName) {
    const config = await this.config;
    return config[configName];
  }

  /**
   * Get full config from postgres and save to this.config
   *
   * @param {schemaItemType} schema
   * @private
   */
  async _fetchFullConfig (schema) {
    this.logger.info(`_fetchFullConfig start ()`);
    await this._fetchConfigRows('20 years');
    const config = this._buildConfigNode('', schema);
    this.configRows = new Map();

    // Initialize regular data fetching and update
    setInterval(async () => {
      await this._flashUpdateSchedule();
      await this._fetchConfigChanges();
    }, UPDATE_TIME * 1000);

    this.logger.info(`_fetchFullConfig finished (config: ${config})`);
    return config;
  }

  /**
   * Get last updated rows from postgres and save to this.config. Emit this.config if it is changed
   *
   * @private
   */
  async _fetchConfigChanges () {
    this.logger.info(`_fetchConfigChanges start ()`);
    await this._fetchConfigRows(`${UPDATE_TIME * 1.5} sec`);
    if (this.configRows.size) {
      const config = await this.config;
      const lastSavedConfig = JSON.stringify(config);
      this._setConfigRowsToConfig(config);
      if (lastSavedConfig !== JSON.stringify(config)) {
        ee.emit('fetch-config');
      }
    }
    this.configRows = new Map();
    this.logger.info(`_fetchConfigChanges finished (this.configRows: ${this.configRows})`);
  }

  /**
   * Save this.configRows to this.config
   *
   * @private
   */
  _setConfigRowsToConfig (config) {
    this.logger.info(`_setConfigRowsToConfig start (this.configRows: ${this.configRows})`);
    Array.from(this.configRows).forEach(([path, row]) => {
      const fieldNames = path.split('.');
      fieldNames.reduce((accum, fieldName, index) => {
        if (index === fieldNames.length - 1) {
          accum[fieldName] = row;
        } else if (!accum[fieldName]) {
          accum[fieldName] = {};
        }
        return accum[fieldName];
      }, config);
    });
    this.logger.info(`_setConfigRowsToConfig finished (this.config: ${config})`);
  }

  /**
   * Fetch all config rows updated during last time $timeString from table $TABLE_NAME
   *
   * @param {string} timeString
   * @private
   */
  async _fetchConfigRows (timeString) {
    this.logger.info(`_fetchConfigRows start (timeString: ${timeString})`);
    const sql = `---
      SELECT *
      FROM ${TABLE_NAME}
      WHERE "updatedAt" > (CURRENT_TIMESTAMP - INTERVAL '${timeString}')`;
    const res = await this._queryPg(sql);
    (res?.rows || []).forEach((row) => {
      this.configRows.set(row.paramPath, row.value);
    });
    this.logger.info(`_fetchConfigRows finished (this.configRows: ${this.configRows})`);
  }

  /**
   * Build config node from rows
   *
   * @param {string} path
   * @param {schemaItemType} nodeSchema
   * @private
   */
  _buildConfigNode (path, nodeSchema) {
    const nodeName = nodeSchema.id;
    let fullPath = path;
    if (nodeName !== '__root__') {
      fullPath = path ? `${path}.${nodeName}` : nodeName;
    }
    const nodeSchemaValue = nodeSchema.value;
    let nodeValue = null;
    if (Array.isArray(nodeSchemaValue)) {
      nodeValue = {};
      nodeSchemaValue.forEach(async (fieldSchema) => {
        const fieldValue = this._buildConfigNode(fullPath, fieldSchema);
        nodeValue[fieldSchema.id] = fieldValue;
      });
    } else {
      nodeValue = this.configRows.get(fullPath);
    }
    return nodeValue;
  }

  /**
   * Close PoolPg instance
   *
   */
  async closePoolPg () {
    this.logger.info(`closePoolPg start ()`);
    if (this.poolCachePg?._connected) {
      await this.poolCachePg.end();
    }
    this.logger.info(`closePoolPg finished ()`);
  }

  /**
   * Return PoolPg instance
   *
   * @private
   */
  async _getPoolPg () {
    this.logger.info(`_getPoolPg start ()`);
    if (!this.poolCachePg) {
      this.poolCachePg = this._initPoolPg(this.options);
    }
    const poolPg = await this.poolCachePg;
    return poolPg;
  }

  /**
   * Initialize PoolPg
   *
   * @param {PoolOptions} options
   * @private
   */
  async _initPoolPg (options) {
    this.logger.info(`_initPoolPg start (options: ${options})`);
    const pool = new Pool(options);
    pool.on('error', (error, client) => {
      client.release(true);
      this.logger.error(error);
    });
    pool.on('connect', async (client) => {
      const { database, processID } = client;
      this.logger.info(`PG client  connected! DB: "${database}" / processID: ${processID}`);
    });
    pool.on('remove', (client) => {
      const { database, processID } = client;
      this.logger.info(`PG client removed. DB: "${database}" / processID: ${processID}`);
    });
    await pool.connect();
    this.logger.info(`_initPoolPg finished ()`);
    return pool;
  }

  /**
   * Send query to postgres
   *
   * @param {string} sqlText
   * @param {string[]} sqlValues
   * @private
   */
  async _queryPg (
    sqlText,
    sqlValues,
  ) {
    this.logger.info(`_queryPg start (sqlText: ${sqlText}, sqlValues: ${sqlValues})`);
    try {
      const pool = await this._getPoolPg();
      const res = await pool.query(sqlText, Array.isArray(sqlValues) ? sqlValues : undefined);
      return res;
    } catch (error) {
      this.logger.error('_queryPg error:', error);
    }
  }

  /**
   * Save updated node for sending to postgres
   *
   * @param {{ configName: string, paramPath: string, value: any }} payload
   */
  scheduleUpdate (payload) {
    this.logger.info(`scheduleUpdate start (payload: ${payload})`);
    this.updates.schedule[payload.paramPath] = payload;
  }

  /**
   * Send all updates to postgres
   *
   * @private
   */
  async _flashUpdateSchedule () {
    this.logger.info(`_flashUpdateSchedule start (his.updates: ${this.updates})`);
    const preRequests = Object.values(this.updates.schedule);
    this.updates.schedule = {};
    if (!preRequests.length) {
      return;
    }

    try {
      const pool = await this._getPoolPg();
      const sqlJoined = preRequests.map(({ configName, paramPath, value }, index) => {
        const preparedValue = prepareSqlValuePg({
          value,
          fieldDef: { dataType: 'jsonb' },
        });
        const sql = `
          INSERT INTO ${TABLE_NAME} ("configName", "paramPath", "value", "updatedAt")
          VALUES ('${configName}', '${paramPath}', ${preparedValue}, CURRENT_TIMESTAMP)
          ON CONFLICT ("paramPath")
          DO UPDATE SET
          "value" = ${preparedValue},
          "updatedAt" = CURRENT_TIMESTAMP`;
        return sql;
      }).join('\n');
      await pool.query(sqlJoined);
      this.logger.info(`_flashUpdateSchedule finished ()`);
    } catch (error) {
      this.logger.error('_flashUpdateSchedule error:', error);
    }
  }
};
