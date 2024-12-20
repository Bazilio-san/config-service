const fs = require('fs');
const path = require('path');
const util = require('util');
const AbstractStorage = require('./AbstractStorage');
const Schema = require('../Schema');
const ConfigServiceError = require('../ConfigServiceError');
const { initLogger } = require('../logger');

const logger = initLogger({ scope: 'FileStorage' });

/**
 * Класс отвечает за запись и чтение данных из файловой системы.
 */
module.exports = class FileStorage extends AbstractStorage {
  constructor () {
    super();
    this.configDir = Schema.getConfigDir();
    this._expectedConfigDir = this.configDir.replace(process.cwd(), '<proj_root>').replace(/\\/g, '/');
    if (!fs.existsSync(this.configDir)) {
      throw this._error(`Missing configuration directory: ${this._expectedConfigDir}`);
    }
    if (!fs.lstatSync(this.configDir).isDirectory()) {
      throw this._error(`The expected configuration directory is a file: ${this._expectedConfigDir}`);
    }
    logger.info(`Constructor init [configDir: ${this.configDir}]`);
  }

  async saveConfig (configName, jsonStr) {
    logger.info(`saveConfig start [configName: ${configName}, jsonStr: ${jsonStr}]`);
    const writeFile = util.promisify(fs.writeFile);
    const configPath = this._getConfigPath(configName);
    await writeFile(configPath, jsonStr);
    logger.info(`saveConfig finish`);
  }

  async getNamedConfig (configName) {
    logger.info(`getNamedConfig start [configName: ${configName}]`);
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
    logger.info(`getNamedConfig start [configValue: ${configValue}]`);
    return configValue ? JSON.parse(configValue) : {};
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

  /**
   * Return an 'ConfigServiceError' error object
   * writes an error message to the console and to the log (if there is an error logger object)
   *
   * @param {String} msg
   * @param {Error} [err]
   * @return {ConfigServiceError}
   */
  _error (msg, err = null) {
    return new ConfigServiceError(msg, err, this);
  }
};
