/* eslint-disable no-unused-expressions, max-len,no-console */
const fse = require('fs-extra');
const path = require('path');

const { logger, fileLogger } = require('../example/logger-service.js');
const i18n = require('../example/i18n/i18n.js')();

const Utils = require('../src/Utils.js');
const Schema = require('../src/Schema.js');
const Params = require('../src/Params.js');
const API = require('../src/API.js');
const REST = require('../src/REST.js');

const serviceOptions = {
  logger,
  loggerFinish: fileLogger.loggerFinish,
  i18n,
  i18nNS: 'cs',
  translatedProperties: ['descr'],
  writeMissingTranslate: true
};

const SCHEMA_DIR = './example/config/service';
const CONFIG_DIR = 'testing';

process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = SCHEMA_DIR;
process.env.NODE_CONFIG_SERVICE_DIR = CONFIG_DIR;

function newInstance (type, addOptions = {}) {
  if (addOptions.writeMissingTranslate === undefined) {
        addOptions.writeMissingTranslate = false;
  }
    Object.entries(addOptions).forEach(([key, val]) => {
        serviceOptions[key] = val;
    });
    if (typeof type === 'string') {
      switch (type) {
        case 'Schema':
          return new Schema(serviceOptions);
        case 'API':
          return new API(serviceOptions);
        case 'RESY':
          return new REST(serviceOptions);
        default:
          return new Params(serviceOptions);
      }
    } else if (type instanceof Utils) {
      // eslint-disable-next-line new-cap
      return new type(serviceOptions);
    }
    return new Params(serviceOptions);
}

function rm (dirPath) {
  if (dirPath.indexOf('.') === 0) {
    dirPath = path.resolve(path.join(process.cwd(), dirPath));
  }
    fse.removeSync(dirPath);
}

function mkd (dirPath) {
  if (dirPath.indexOf('.') === 0) {
    dirPath = path.resolve(path.join(process.cwd(), dirPath));
  }
    // fse.removeSync(dirPath);
    fse.mkdirpSync(dirPath);
}

function r (resource) {
  return `./test/resources/${resource}`;
}

function cpf (src, dest) {
  if (src.indexOf('.') === 0) {
    src = path.resolve(path.join(process.cwd(), src));
  }
  if (dest.indexOf('.') === 0) {
    dest = path.resolve(path.join(process.cwd(), dest));
  }
    fse.copySync(src, dest, { overwrite: true });
}

function cpr (src, dest) {
  cpf(r(src), dest);
}

function clrRequire (src) {
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

function _copySchema (src) {
  const schemaDir = REST.getSchemaDir();
  cpf(src, `${schemaDir}/schema.js`);
  clrRequire(`${schemaDir}/schema.js`);
}

function cpSchemaFromResources (src) {
  _copySchema(r(src));
}

function clearTestEnv () {
  rm(REST.getConfigDir());
  const schemaDir = REST.getSchemaDir();
  rm(`${schemaDir}/schema.js`);
  rm(schemaDir);
}

function niError (type, doBefore, fnName, ...args) {
  let errMsg = 'There was no error';
  let instance;
  try {
    if (doBefore === undefined) {
      instance = newInstance(type);
    } else if (typeof doBefore === 'string') { // doBefore -> fnName;
      instance = newInstance(type);
            instance[doBefore](fnName, ...args);
    } else if (typeof doBefore === 'function') {
      instance = newInstance(type);
      doBefore(instance);
            instance[fnName](...args);
    } else {
      return 'Unrecognized signature passed to niError function';
    }
  } catch (err) {
    errMsg = err.message;
  }
  return errMsg;
}

module.exports = (context) => ({
  pr: (src) => path.resolve(path.join(context.__dirname, src)),
  cpSchemaCtx: (src) => {
    src = path.resolve(path.join(context.__dirname, src));
    _copySchema(src);
  },
  Schema,
  Params,
  REST,
  API,
  newInstance,
  i18n,
  serviceOptions,
  SCHEMA_DIR,
  CONFIG_DIR,
  r,
  mkd,
  rm,
  cpf,
  cpr,
  cpc: (src, dest) => {
    cpf(path.resolve(path.join(context.__dirname, src)), dest);
  },
  clrRequire,
  cpSchemaFromResources,
  clearTestEnv,

  niError,

  fnError (instance, fnName, ...args) {
    let errMsg = 'There was no error';
    try {
            instance[fnName](...args);
    } catch (err) {
      errMsg = err.message;
    }
    return errMsg;
  },

  prepareTestEnv (isNewInstance = true, schemaDir = SCHEMA_DIR, configDir = CONFIG_DIR, addOptions = {}) {
        process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = schemaDir;
        process.env.NODE_CONFIG_SERVICE_DIR = configDir;
        const configPath = Params.getConfigDir();
        clearTestEnv();
        mkd(Params.getSchemaDir());
        mkd(configPath);
        cpSchemaFromResources('schema.js');
        ['config1', 'config-2'].forEach((configName) => {
          cpr(`${configName}.json`, `${configPath}/${configName}.json`);
          clrRequire(`${configPath}/${configName}.json`);
        });
        if (isNewInstance === false) {
          return null;
        }
        return newInstance(isNewInstance, addOptions);
  }
});
