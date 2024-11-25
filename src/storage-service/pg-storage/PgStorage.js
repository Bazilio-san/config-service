const { prepareSqlValuePg, queryPg } = require('af-db-ts');
const AbstractStorage = require('../AbstractStorage');
const ee = require('../../ee');
const { FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS, TABLE_NAME, MAX_FLASH_UPDATE_INSERT_INSTRUCTIONS } = require('./pg-service-config');
const { initLogger } = require('../../logger');

// TODO описать структуру pgStorageOptions

const isDebug = true; // VVQ Спросить - расскажу, как сделать

const debugIt = (message) => {
  if (!isDebug) {
    return;
  }
  this.logger.info(message);
};

const recreateObjectByPath = (obj, path, value) => {
  const keys = path.split('.').filter((v) => `${v}`.trim());
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      // If it's the last key, set the value
      current[key] = value;
    } else {
      // If the key doesn't exist or isn't an object, create an empty object
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      // Move to the next nested object
      current = current[key];
    }
  }
  return obj;
};

let globalFlushIntervalId = null;

/**
 * Класс отвечает за запись и чтение данных из базы дынных.
 */
module.exports = class PgStorage extends AbstractStorage {
  constructor (pgStorageOptions, schema) {
    super();
    this.dbId = pgStorageOptions.dbId;
    this.updates = { schedule: {} };
    this.schema = schema;
    this.configRows = new Map(); // VVA упразднить configRows! использовать schema
    this.logger = initLogger({ scope: 'PgStorage' });
    // Initialize regular data fetching and update
    clearInterval(globalFlushIntervalId); // VVQ Это надо на случай повторной инициализации
    globalFlushIntervalId = setInterval(async () => {
      await this._flashUpdateSchedule();
      // await this._fetchConfigChanges(); VVR - это не нужно, т.к. до помещения в кеш апдейта изменение должно уже быть в памяти
    }, FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS);
    this._fetchFullConfig(this.schema)
    // this.config = this._fetch@FullConfig(this.schema); // VVR
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
    this.configRows = new Map();
    const sql = `---
      SELECT *
      FROM ${TABLE_NAME}
      WHERE "configName" = '${configName}'
      `;
    const res = await this._queryPg(sql);
    const obj = {};

    (res?.rows || []).forEach((row) => {
      const { paramPath, value } = row;
      recreateObjectByPath(obj, paramPath, value);
    });
    return obj.configName;
  }

  /**
   * Get full config from postgres and save to this.config
   *
   * @param {schemaItemType} schema
   * @private
   */
  async _fetchFullConfig (schema) { // VVR
    await this._fetchConfigRows();
    return this._buildConfigNode('', schema);
  }

  // async _fetch_FullConfig (schema) {
  //   // VVA не нужно смешивать инициализацию таймера и получение конфига
  //   await this._fetch@ConfigRows('100 years');
  //   const config = this._build@ConfigNode('', schema);
  //
  //   // Initialize regular data fetching and update
  //   setInterval(async () => {
  //     await this._flashUpdateSchedule();
  //     await this._fetchConfigChanges();
  //   }, FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS);
  //
  //   return config;
  // }

  // VVR Это не нужно
  // async _fetchConfigChanges () {
  //   const intervalSeconds = Math.round(FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS * 1.5 / 100) / 10;
  //   await this._fetch@ConfigRows(`${intervalSeconds} sec`);
  //   if (this.configRows.size) {
  //     const config = await this.config;
  //     this._setConfigRowsToConfig(config);
  //     ee.emit('fetch-config');
  //   }
  // }

  // VVR Это не нужно
  // _setConfigRowsToConfig (config) {
  //   Array.from(this.configRows).forEach(([path, row]) => {
  //     const fieldNames = path.split('.');
  //     fieldNames.reduce((accum, fieldName, index) => {
  //       if (index === fieldNames.length - 1) {
  //         accum[fieldName] = row;
  //       } else if (!accum[fieldName]) {
  //         accum[fieldName] = {};
  //       }
  //       return accum[fieldName];
  //     }, config);
  //   });
  // }

  /**
   * Fetch all config rows updated during last time $timeString from table $TABLE_NAME
   *
   * @param {string} timeString
   * @private
   */
  async _fetchConfigRows (timeString = undefined) {
    debugIt(`_fetch@ConfigRows start (timeString: ${timeString})`);
    this.configRows = new Map();
    const sql = `---
      SELECT *
      FROM ${TABLE_NAME}
      ${timeString ? `WHERE "updatedAt" > (CURRENT_TIMESTAMP - INTERVAL '${timeString}')` : ''}
      `;
    const res = await this._queryPg(sql);
    (res?.rows || []).forEach((row) => {
      this.configRows.set(row.paramPath, row.value); // VVA упразднить configRows! использовать schema
    });
    debugIt(`_fetch@ConfigRows finished (this.configRows: ${this.configRows})`);
  }

  // VVR - вместо этого использовать функции Params
  // _buildConfigNode (path, nodeSchema) {
  //   // VVA упразднить configRows! использовать schema
  //   const nodeName = nodeSchema.id;
  //   let fullPath = path;
  //   if (nodeName !== '__root__') {
  //     fullPath = path ? `${path}.${nodeName}` : nodeName;
  //   }
  //   const nodeSchemaValue = nodeSchema.value;
  //   let nodeValue = null;
  //   if (Array.isArray(nodeSchemaValue)) {
  //     nodeValue = {};
  //     nodeSchemaValue.forEach(async (fieldSchema) => {
  //       nodeValue[fieldSchema.id] = this._buildConfigNode(fullPath, fieldSchema);
  //     });
  //   } else {
  //     nodeValue = this.configRows.get(fullPath) ?? nodeSchemaValue;
  //   }
  //   return nodeValue;
  // }

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
    const preRequests = schedule.filter((item) => this.configRows.get(item.paramPath) !== item.value);
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
