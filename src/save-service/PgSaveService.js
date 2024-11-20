const { Pool } = require('pg');
const SaveService = require('./SaveService');

const _5_MIN = 5 * 60_000; // 5 min
const _3_HOURS = 3_600_000 * 3; // 3 ч
const TABLE_NAME = 'core.settings';

const defaultOptions = {
  // all valid client config options are also valid here
  // in addition here are the pool specific configuration parameters:
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: _5_MIN, // 5 min
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis: _3_HOURS, // 3 h
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max: 10,
  port: 5432,
  statement_timeout: _3_HOURS, // number of milliseconds before a statement in query will time out, default is no timeout
  query_timeout: _3_HOURS // number of milliseconds until the request call times out, no timeout by default
};

/**
 * Класс отвечает за запись и чтение данных из базы дынных.
 */
module.exports = class PgSaveService extends SaveService {
  constructor (options) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.getPoolPg();
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
    sqlValues
  ) {
    try {
      const pool = await this.getPoolPg();
      const res = await pool.query(sqlText, Array.isArray(sqlValues) ? sqlValues : undefined);
      return res?.rows?.[0]?.configValue ?? '';
    } catch (error) {
      console.error(error);
    }
  }
};
