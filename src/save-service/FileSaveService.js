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
  async saveConfig (configFileName, jsonStr) {
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(configFileName, jsonStr);
  }

  // eslint-disable-next-line class-methods-use-this
  async getConfig (configName) {
    const readFile = util.promisify(fs.readFile);
    let configValue = null;
    const configFileName = this._getConfigFileName(configName);
    if (fs.existsSync(configFileName)) {
      try {
        this._deleteRequireCacheFor(configFileName);
        // eslint-disable-next-line import/no-dynamic-require
        // configValue = require(configFileName);
        configValue = await readFile(configFileName);
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
  _getConfigFileName (configName) {
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
