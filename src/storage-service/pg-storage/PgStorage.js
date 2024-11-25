const { prepareSqlValuePg, queryPg } = require('af-db-ts');
const AbstractStorage = require('../AbstractStorage');
const ee = require('../../ee');
const { FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS, TABLE_NAME, MAX_FLASH_UPDATE_INSERT_INSTRUCTIONS } = require('./pg-service-config');
const { initLogger } = require('../../logger');
const { debugCS } = require('../../debug');

// TODO описать структуру pgStorageOptions

const debugIt = (message) => {
  if (!debugCS.enabled) {
    return;
  }
  debugCS(message);
};

const setConfigRowsToConfig = (config, configRows) => {
  configRows.forEach((row) => {
    const { paramPath, value } = row;
    const fieldNames = paramPath.split('.');
    fieldNames.reduce((accum, fieldName, index) => {
      if (index === fieldNames.length - 1) {
        accum[fieldName] = value;
      } else if (!accum[fieldName] || typeof accum[fieldName] !== 'object') {
        accum[fieldName] = {};
      }
      return accum[fieldName];
    }, config);
  });
};

let globalFlushIntervalId = null;

/**
 * Класс отвечает за запись и чтение данных из базы дынных.
 */
module.exports = class PgStorage extends AbstractStorage {
  constructor (pgStorageOptions) {
    super();
    this.dbId = pgStorageOptions.dbId;
    this.updates = { schedule: {} };
    this.lastFetchedRows = new Map(); // Последние полученные строки
    this.logger = initLogger({ scope: 'PgStorage' });
    // Initialize regular data fetching and update
    clearInterval(globalFlushIntervalId); // VVQ Это надо на случай повторной инициализации
    globalFlushIntervalId = setInterval(async () => {
      await this._flashUpdateSchedule();
      await this._fetchConfigChanges();
    }, FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS);
  }

  /**
   * Send query to postgres
   *
   * @param {string} sqlText
   * @param {string[]} [sqlValues]
   * @param {boolean} [throwError]
   * @private
   */
  async _queryPg (sqlText, sqlValues, throwError = false) {
    debugIt(`_queryPg start (sqlText: ${sqlText}, sqlValues: ${sqlValues})`); // VVQ a если не передано sqlValues, Еси передао - это не будет красиво отображено
    return queryPg(this.dbId, sqlText, sqlValues, throwError);
  }

  /**
   * Get config by configName
   *
   * @param {string} configName
   */
  async getNamedConfig (configName) {
    const sql = `---
      SELECT *
      FROM ${TABLE_NAME}
      WHERE "configName" = '${configName}'
      `;
    const res = await this._queryPg(sql);
    const obj = {};
    const rows = res?.rows ?? [];
    if (rows.length) {
      rows.forEach((row) => {
        this.lastFetchedRows.set(row.paramPath, row.value);
      });
      setConfigRowsToConfig(obj, rows);
    }
    return obj[configName];
  }

  async _fetchConfigChanges () {
    // eslint-disable-next-line no-mixed-operators
    const intervalSeconds = Math.round(FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS * 1.5 / 1000);
    const timeString = `${intervalSeconds.toString()} sec`;
    debugIt(`_fetchConfigChanges start (timeString: ${timeString})`);
    this.configRows = new Map();
    const sql = `---
      SELECT *
      FROM ${TABLE_NAME}
      ${timeString ? `WHERE "updatedAt" > (CURRENT_TIMESTAMP - INTERVAL '${timeString}')` : ''}
      `;
    const res = await this._queryPg(sql);
    const obj = {};
    const rows = res?.rows ?? [];
    this.lastFetchedRows.clear();
    if (rows.length) {
      rows.forEach((row) => {
        this.lastFetchedRows.set(row.paramPath, row.value);
      });
      setConfigRowsToConfig(obj, rows);
      ee.emit('remote-config-changed', obj);
    }
    debugIt(`_fetchConfigChanges finished (this.configRows: ${this.configRows})`);
  }

  /**
   * Save updated node for sending to postgres
   *
   * @param {{ configName: string, paramPath: string, value: any }} payload
   */
  scheduleUpdate (payload) {
    debugIt(`scheduleUpdate start (payload: ${payload})`);
    this.updates.schedule[payload.paramPath] = payload;
  }

  /**
   * Send all updates to postgres
   *
   * @private
   */
  async _flashUpdateSchedule () {
    debugIt(`_flashUpdateSchedule start (this.updates: ${this.updates})`);
    const schedule = Object.values(this.updates.schedule);
    const preRequests = schedule.filter((item) => this.lastFetchedRows.get(item.paramPath) !== item.value);
    this.updates.schedule = {};
    if (!preRequests.length) {
      return;
    }
    while (preRequests.length) {
      const batch = preRequests.splice(0, MAX_FLASH_UPDATE_INSERT_INSTRUCTIONS);
      const sqlText = batch.map(({ configName, paramPath, value }) => {
        const preparedValue = prepareSqlValuePg({ value, fieldDef: { dataType: 'jsonb' } });
        return `
          INSERT INTO ${TABLE_NAME} ("configName", "paramPath", "value", "updatedAt")
          VALUES ('${configName}', '${paramPath}', ${preparedValue}, CURRENT_TIMESTAMP)
          ON CONFLICT ("paramPath")
          DO UPDATE SET
            "value" = EXCLUDED."value",
            "updatedAt" = CURRENT_TIMESTAMP;`;
      }).join('\n');
      await this._queryPg(sqlText);
    }
  }
};
