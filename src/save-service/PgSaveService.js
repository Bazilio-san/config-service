const { Pool } = require('pg');
const SaveService = require('./SaveService');
const { TABLE_NAME, defaultOptions } = require('./db-storage/pg-service-config.js');

/**
 * Класс отвечает за запись и чтение данных из базы дынных.
 */
module.exports = class PgSaveService extends SaveService {
  constructor (options) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.getPoolPg();
    this.updates = { schedule: {} };
    this.initFlashUpdateSchedule();
  }

  /**
   * Save config to postgres
   *
   * @param {string} configName
   * @param {string} configValue
   */
  async saveConfig (configName, configValue) {
    const sql = `---
      INSERT INTO ${TABLE_NAME} ("configName", "configValue")
      VALUES ('${configName}', $1)
      ON CONFLICT ("configName")
      DO UPDATE SET "configValue" = $1
      `;
    await this.queryPg(sql, [configValue]);
  }

  /**
   * Get config from postgres by configName
   *
   * @param {string} configName
   */
  async getConfig (configName) {
    const sql = `---
      SELECT "configValue"
      FROM ${TABLE_NAME}
      WHERE "configName" = '${configName}'`;
    const res = await this.queryPg(sql);
    return JSON.parse(res);
  }

  /**
   * Close PoolPg instance
   *
   */
  async closePoolPg () {
    const pool = this.poolCachePg;
    if (!pool) return;
    const fns = (pool._clients || [])
      .filter((client) => client?._connected && typeof client?.end === 'function')
      .map((client) => client.end());
    await Promise.all(fns);
  }

  /**
   * Return PoolPg instance
   *
   * @private
   */
  async getPoolPg () {
    if (!this.poolCachePg) {
      this.poolCachePg = this.initPoolPg(this.options);
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
  async initPoolPg (options) {
    const pool = new Pool(options);
    this.initListeners(pool);
    await pool.connect();
    return pool;
  }

  /**
   * Initialize PoolPg listeners
   *
   * @param {IPoolPg} pool
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  initListeners (pool) {
    pool.on('error', (error, client) => {
      client.release(true);
      console.error(error);
    });
    pool.on('connect', async (client) => {
      const { database, processID } = client;
      console.log(`PG client  connected! DB: "${database}" / processID: ${processID}`);
    });
    pool.on('remove', (client) => {
      const { database, processID } = client;
      console.log(`PG client removed. DB: "${database}" / processID: ${processID}`);
    });
  }

  /**
   * Send query to postgres
   *
   * @param {string} sqlText
   * @param {string[]} sqlValues
   * @private
   */
  async queryPg (
    sqlText,
    sqlValues,
  ) {
    try {
      const pool = await this.getPoolPg();
      const res = await pool.query(sqlText, Array.isArray(sqlValues) ? sqlValues : undefined);
      return res?.rows?.[0]?.configValue ?? '';
    } catch (error) {
      console.error(error);
    }
  }

  scheduleUpdate (payload) {
    this.updates.schedule[payload.paramPath] = payload;
  }

  async flashUpdateSchedule () {
    const preRequests = Object.values(this.updates.schedule);
    this.updates.schedule = {};
    if (!preRequests.length) {
      return true;
    }
    const values = [];
    const sql = preRequests.map(({ configName, paramPath, value }, index) => {
      values.push(value);
      // @formatter:off
      return `INSERT INTO ${TABLE_NAME} ("configName", "paramPath", "value", "updatedAt")
      VALUES ('${configName}', '${paramPath}', $${index + 1}, CURRENT_TIMESTAMP)
      ON CONFLICT ("paramPath")
      DO UPDATE SET
          "value" = $${index + 1},
          "updatedAt" = CURRENT_TIMESTAMP;`;
      // @formatter:on
    }).join('\n');
    try {
      const pool = await this.getPoolPg();
      const res = await pool.query(sql, values);
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  initFlashUpdateSchedule () {
    setInterval(() => {
      this.flashUpdateSchedule();
    }, 1000);
  }

  async getNamedConfigDB (configName) {
    const sql = `---
      SELECT * FROM ${TABLE_NAME}
      WHERE "configName" = '${configName}'`;
    const res = await this.queryPg(sql);
    return res;
  }
};
