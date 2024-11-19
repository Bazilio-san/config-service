const fs = require('fs');
const path = require('path');
const util = require('util');
const SaveService = require('./SaveService');

/**
 * Класс отвечает за запись и чтение данных из файловой системы.
 */
module.exports = class FileSaveService extends SaveService {
  constructor (configDir) {
    super();
    this.configDir = configDir;
  }

  // eslint-disable-next-line class-methods-use-this
  async saveConfig (configName, jsonStr) {
    const writeFile = util.promisify(fs.writeFile);
    const configPath = this._getConfigPath(configName);
    await writeFile(configPath, jsonStr);
  }

  // eslint-disable-next-line class-methods-use-this
  async getConfig (configName) {
    const readFile = util.promisify(fs.readFile);
    let configValue = null;
    const configPath = this._getConfigPath(configName);
    if (fs.existsSync(configPath)) {
      try {
        this._deleteRequireCacheFor(configPath);
        configValue = await readFile(configPath);
      } catch (err) {
        throw this._error(`Could not load named configuration file «${this._expectedConfigDir}/${configName}.json»`, err);
      }
    }
    return configValue;
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
   * Clearing cache require
   */
  // eslint-disable-next-line class-methods-use-this
  _deleteRequireCacheFor (src) {
    if (src.indexOf('.') === 0) {
      src = path.resolve(path.join(process.cwd(), src));
    }
    let resolved = src;
    try {
      resolved = require.resolve(src);
    } catch (e) {
      //
    }
    delete require.cache[resolved];
  }
};
