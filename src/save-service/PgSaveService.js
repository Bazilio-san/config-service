const { Pool } = require('pg');
const SaveService = require('./SaveService');
const { TABLE_NAME, defaultOptions } = require('./db-storage/pg-service-config.js');
const ee = require('../ee');
const { UPDATE_TIME } = require('./db-storage/pg-service-config');

/**
 * Класс отвечает за запись и чтение данных из базы дынных.
 */
module.exports = class PgSaveService extends SaveService {
  constructor (options, schema) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.getPoolPg(); // VVQ?
    this.updates = { schedule: {} };
    this.schema = schema;
    this.config = {};
    this.configRows = new Map();

    // Initialize regular data fetching and update
    setInterval(async () => {
      await this.flashUpdateSchedule();
      await this._fetchConfigChanges();
    }, UPDATE_TIME * 1000);
  }

  /**
   * Get last updated rows from postgres and save to this.config. Emit this.config if it is changed
   *
   * @private
   */
  async _fetchConfigChanges () {
    await this.fetchConfigRows(`${UPDATE_TIME * 1.5} sec`);
    if (this.configRows.size) {
      const lastSavedConfig = this.config;
      this.setConfigRowsToConfig();
      if (JSON.stringify(lastSavedConfig) !== JSON.stringify(this.config)) {
        ee.emit('fetch-config');
      }
    }
    this.configRows = new Map();
  }

  /**
   * Get config by configName
   *
   * @param {string} configName
   */
  async getConfig (configName) {
    // Get full config from postgres and save to this.config
    await this.fetchConfigRows('20 years');
    this.config = this.buildConfigNode('', this.schema);
    this.configRows = new Map();
    return this.config[configName];
  }

  /**
   * Update config node
   *
   * @param {string} configName
   * @param {string} paramPath
   * @param {any} node
   * @private
   */
  updateConfigNode (configName, paramPath, node) {
    if (typeof node === 'object') { // VVQ а если значение листа - объект?
      Object.entries(node).forEach(([title, value]) => {
        this.updateConfigNode(configName, `${paramPath}.${title}`, value);
      });
    } else {
      this.scheduleUpdate({ configName, paramPath, value: node });
    }
  }

  /**
   * Save this.configRows to this.config
   *
   * @private
   */
  setConfigRowsToConfig () {
    Array.from(this.configRows).forEach(([path, row]) => {
      const fieldNames = path.split('.');
      fieldNames.reduce((accum, fieldName, index) => {
        if (index === fieldNames.length - 1) {
          accum[fieldName] = row;
        } else if (!accum[fieldName]) {
          accum[fieldName] = {};
        }
        return accum[fieldName];
      }, this.config);
    });
  }

  /**
   * Fetch all config rows updated during last time $timeString from table $TABLE_NAME
   *
   * @param {string} timeString
   * @private
   */
  async fetchConfigRows (timeString) {
    const sql = `---
      SELECT *
      FROM ${TABLE_NAME}
      WHERE "updatedAt" > (CURRENT_TIMESTAMP - INTERVAL '${timeString}')`;
    const res = await this.queryPg(sql); // VVQ здесь может быть undefined
    (res?.rows || []).forEach((row) => {
      this.configRows.set(row.paramPath, row.value);
    });
  }

  /**
   * Build config node from rows
   *
   * @param {string} path
   * @param {schemaItemType} nodeSchema
   * @private
   */
  buildConfigNode (path, nodeSchema) {
    const nodeName = nodeSchema.id;
    let fullPath = path;
    if (nodeName !== '__root__') {
      fullPath = path ? `${path}.${nodeName}` : nodeName;
    }
    const nodeSchemaValue = nodeSchema.value;
    let nodeValue = null;
    if (Array.isArray(nodeSchemaValue)) { // VVQ Что будет, если значение листа - массив или объект
      nodeValue = {};
      nodeSchemaValue.forEach(async (fieldSchema) => {
        nodeValue[fieldSchema.id] = this.buildConfigNode(fullPath, fieldSchema);
      });
    } else {
      nodeValue = this.configRows.get(fullPath);
    }
    return nodeValue;
  }

  /**
   * Return PoolPg instance
   *
   * @private
   */
  async getPoolPg () {
    if (!this.poolCachePg) {
      const pool = new Pool(this.options);
      pool.on('error', (error, client) => {
        client.release(true);
        console.error(error); // VVQ Logger
      });
      pool.on('connect', async (client) => {
        const { database, processID } = client;
        console.log(`PG client  connected! DB: "${database}" / processID: ${processID}`); // VVQ Logger
      });
      pool.on('remove', (client) => {
        const { database, processID } = client;
        console.log(`PG client removed. DB: "${database}" / processID: ${processID}`); // VVQ Logger
      });
      await pool.connect();
      this.poolCachePg = pool;
    }
    return this.poolCachePg;
  }

  /**
   * Close PoolPg instance
   *
   */
  async closePoolPg () {
    if (this.poolCachePg?._connected) {
      await this.poolCachePg.end();
    }
  }

  /**
   * Send query to postgres
   *
   * @param {string} sqlText
   * @param {string[]} sqlValues
   * @private
   */
  async queryPg (sqlText, sqlValues) {
    try {
      const pool = await this.getPoolPg();
      const res = await pool.query(sqlText, Array.isArray(sqlValues) ? sqlValues : undefined);
      return res;
    } catch (error) {
      console.error(error); // VVQ logger
    }
  }

  /**
   * Save updated node for sending to postgres
   *
   * @param {{ configName: string, paramPath: string, value: any }} payload
   */
  scheduleUpdate (payload) {
    this.updates.schedule[payload.paramPath] = payload;
  }

  /**
   * Send all updates to postgres
   *
   * @private
   */
  async flashUpdateSchedule () {
    const preRequests = Object.values(this.updates.schedule);
    this.updates.schedule = {};
    if (!preRequests.length) {
      return;
    }

    try {
      const pool = await this.getPoolPg();
      const promises = preRequests.map(async ({ configName, paramPath, value }) => {
        value = prepareSqlValuePg(value, { });
        const sql = `
          INSERT INTO ${TABLE_NAME} ("configName", "paramPath", "value", "updatedAt")
          VALUES ('${configName}', '${paramPath}', $1, CURRENT_TIMESTAMP)
            ON CONFLICT ("paramPath")
            DO UPDATE SET
            "value" = ${pr}, "updatedAt" = CURRENT_TIMESTAMP`;
        await pool.query(sql, [value]);
      });
      await Promise.all(promises); // VVQ так не надо!
    } catch (error) {
      console.error(error); // VVQ logger
    }
  }
};
