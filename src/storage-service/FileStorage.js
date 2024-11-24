const fs = require('fs');
const path = require('path');
const util = require('util');
const AbstractStorage = require('./AbstractStorage');
const Schema = require('../Schema');

/**
 * Класс отвечает за запись и чтение данных из файловой системы.
 */
module.exports = class FileStorage extends AbstractStorage {
  constructor () {
    super();
    this.configDir = Schema.getConfigDir();
    this._expectedConfigDir = this.configDir.replace(process.cwd(), '<proj_root>').replace(/\\/g, '/');
    if (!fs.existsSync(this.configDir)) {
      // VVA - this._error - отсутсьвует
      throw this._error(`Missing configuration directory: ${this._expectedConfigDir}`);
    }
    if (!fs.lstatSync(this.configDir).isDirectory()) {
      throw this._error(`The expected configuration directory is a file: ${this._expectedConfigDir}`);
    }
  }

  async saveConfig (configName, jsonStr) {
    const writeFile = util.promisify(fs.writeFile);
    const configPath = this._getConfigPath(configName);
    await writeFile(configPath, jsonStr);
  }

  async getConfig (configName) {
    const readFile = util.promisify(fs.readFile);
    let configValue = null;
    const configPath = this._getConfigPath(configName);
    if (fs.existsSync(configPath)) {
      try {
        configValue = await readFile(configPath);
      } catch (err) {
        throw this._error(`Could not load named configuration file «${this._expectedConfigDir}/${configName}.json»`, err);
      }
    }
    // VVQ - А если файла нет? JSON.parse(null)?
    return JSON.parse(configValue);
  }

  /**
   * Returns the full path to a named configuration file by its name
   *
   * @private
   * @param {string} configName
   * @return {string}
   */
  _getConfigPath (configName) {
    return `${this.configDir + path.sep + configName}.json`;
  }
};
