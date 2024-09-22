/* eslint-disable class-methods-use-this, max-len, max-classes-per-file, no-prototype-builtins, no-bitwise,no-await-in-loop */

const path = require('path');
const fs = require('fs');
const __ = require('./lib.js');
const Schema = require('./Schema.js');

const _isRootNode_ = Symbol.for('_isRootNode_');
const _v_ = Symbol.for('_v_');
const _isSection_ = Symbol.for('_isSection_');
const _isProp_ = Symbol.for('_isProp_');
const _onChange_ = Symbol.for('_onChange_');
const _callerId_ = Symbol.for('_callerId_');

/**
 * Initialization:
 * - Filling a Schema object (this.schema)
 * - Filling the 'defaults' (this.defaults) - This is a Schema structure with default property values.
 * - Filling the Schema with actual values
 * - Re-saving parts of the configuration after their normalization.
 *
 * During the initialization process, checks are carried out:
 * - presence of a configuration directory
 * - the presence of a Schema file
 * - data in the Schema file
 * - validity of Schema file and configuration files (js/json validity)
 */

function fnFoo () {
}

module.exports = class Params extends Schema {
  constructor (serviceOptions = {}) {
    super(serviceOptions);
    const { onSaveNamedConfig, jsonStringifySpace } = serviceOptions;
    this.onSaveNamedConfig = typeof onSaveNamedConfig === 'function' ? onSaveNamedConfig : fnFoo;
    this.jsonStringifySpace = Number(jsonStringifySpace) || 2;
    if (!this.useInit) {
      this._reloadConfig().then(() => {
        this.defaults = this._getDefaults();
      });
    }
  }

  async init () {
    await super.init();
    const noReloadSchema = true;
    await this._reloadConfig(noReloadSchema);
    this.defaults = this._getDefaults();
  }

  // ============================ GET VALUES =============================

  /**
   * Returns a configuration object with values collected from the passed Schema
   * If value === undefined in the scheme, defaultValue is returned.
   *
   * @param {schemaFragmentType} schemaFragment
   * @param {Object} valuesContainer
   * @param {String[]} pathArr
   * @return {Object}
   */
  _getValuesFromSchemaFragment (schemaFragment = this.schema, valuesContainer = {}, pathArr = []) {
    let container = valuesContainer;
    let schemaValue = schemaFragment;
    if (__.isSchemaItem(schemaFragment)) {
      const { id, value, type } = schemaFragment;
      pathArr.push(id);
      if (type !== 'section') {
        valuesContainer[id] = value;
        return valuesContainer;
      }
      valuesContainer[id] = {};
      schemaValue = schemaFragment.value;
      container = valuesContainer[id];
    }
    if (Array.isArray(schemaValue)) {
      schemaValue.forEach((schemaItem) => {
        const { id, value, defaultValue, type } = schemaItem;
        const isSection = type === 'section';
        if (value === undefined) {
          return defaultValue;
        }
        if (value === null) {
          container[id] = null;
          return;
        }
        if (isSection) {
          const sectionValue = this._getValuesFromSchemaFragment(value, container[id], [...pathArr, id]);
          container[id] = __.isNonEmptyObject(sectionValue) ? sectionValue : {};
          // Empty section values - null !!
        } else if (type === 'array') {
          // eslint-disable-next-line no-nested-ternary
          container[id] = Array.isArray(value) ? value : (Array.isArray(defaultValue) ? defaultValue : null);
        } else if (type === 'json') {
          container[id] = this._normalizeJSON(value);
        } else {
          container[id] = value;
        }
      });
    }
    return valuesContainer;
  }

  /**
   * Get the value of a configuration parameter along its path
   *
   * @param {propPathType} paramPath
   * @param {Object} options
   * @return {*}
   */
  _getValues (paramPath, options = {}) {
    options.callFrom = options.callFrom || '_getValues';
    const { schemaItem, lastParamName } = this._parseParamPath(paramPath, options);
    const values = this._getValuesFromSchemaFragment(schemaItem);
    return lastParamName ? values[lastParamName] : values.__root__;
  }

  // ============================ FILL SCHEMA BY VALUES =============================

  __addNewValueCallback (schemaItem, { absentPaths, appliedPaths }) {
    // eslint-disable-next-line camelcase,prefer-const
    const {
      value,
      [_v_]: currentValue,
      [_onChange_]: onChange,
      [_isSection_]: isSection,
      [_isProp_]: isProp,
      path: paramPath
    } = schemaItem || {};
    if (isSection && Array.isArray(value)) {
      if (__.canDeepDive(currentValue)) {
        const sIds = value.map(({ id }) => id);
        const vIds = Object.keys(currentValue);
        vIds.filter((id) => !sIds.includes(id)).forEach((v) => {
          absentPaths.add(`${paramPath}.${v}`);
        });
        vIds.filter((id) => sIds.includes(id)).forEach((v) => {
          appliedPaths.add(`${paramPath}.${v}`);
        });
      } else if (currentValue !== undefined && !__.isObject(currentValue)) {
        throw this._error(`Cannot set a value «${currentValue}» for a 'section' «${paramPath}»`);
      }
      value.forEach((childSchemaItem) => {
        if (__.isSchemaItem(childSchemaItem)) {
          childSchemaItem[_v_] = __.canDeepDive(currentValue) ? currentValue[childSchemaItem.id] : undefined;
          if (onChange !== undefined) {
            childSchemaItem[_onChange_] = onChange;
          }
        }
      });
    } else if (isProp) {
      if (onChange !== undefined) {
        schemaItem.value = { value: currentValue, [_onChange_]: onChange };
      } else {
        schemaItem.value = currentValue;
      }
      delete schemaItem[_onChange_];
      delete schemaItem[_callerId_];
    }
  }

  /**
   * Fills the Schema with actual values
   */
  _fillSchemaWithValues (paramPath, newValues, options = {}) {
    options.callFrom = options.callFrom || '_fillSchemaWithValues';
    const { pathArr, schemaItem } = this._parseParamPath(paramPath, options);
    const absentPaths = new Set();
    const appliedPaths = new Set();
    const traverseOptions = { pathArr, absentPaths, appliedPaths };
    schemaItem[_v_] = newValues;
    if (options.onChange !== undefined) {
      schemaItem[_onChange_] = options.onChange;
    }
    schemaItem[_callerId_] = options.callerId;
    this._traverseSchema(schemaItem, traverseOptions, this.__addNewValueCallback);
    if (absentPaths.size) {
      // console.log(`Missed:\n${[...absentPaths].join('\n')}`);
    }
  }

  // ============================ PARAMETERS =============================

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
   * Saving named configuration data to a file
   * Data must be pre-checked and normalized and stored in the configuration object.
   *
   * @param {String} configName
   */
  _saveNamedConfig (configName) {
    let configValue = this._getValues(configName);
    // The named configuration must be an object !!!
    if (!__.isObject(configValue)) {
      configValue = {};
    }
    let jsonStr;
    try {
      jsonStr = JSON.stringify(configValue, undefined, this.jsonStringifySpace);
    } catch (err) {
      throw this._error(`Could not save named configuration «${
        this._expectedConfigDir}/${configName}.json»`, err); // Not covered with tests
    }
    fs.writeFileSync(this._getConfigFileName(configName), jsonStr);
    this.onSaveNamedConfig(configName, this);
  }

  /**
   * re-/loading named configuration file.
   */
  _readNamedConfig (configName) {
    const configFileName = this._getConfigFileName(configName);
    let configValue = {};
    if (fs.existsSync(configFileName)) {
      try {
        this._deleteRequireCacheFor(configFileName);
        // eslint-disable-next-line import/no-dynamic-require
        configValue = require(configFileName);
      } catch (err) {
        throw this._error(`Could not load named configuration file «${this._expectedConfigDir}/${configName}.json»`, err);
      }
    }
    return configValue;
  }

  /**
   * Parse the path to the parameter into parts. Casting to an array. Validation
   *
   * The presence and correspondence of the type in the Schema for the specified path is checked.
   * Information is cached.
   *
   * @private
   * @param {propPathType} paramPath
   * @param {Object} options
   * @return {Object}
   */
  _parseParamPath (paramPath = '', options = {}) {
    options.callFrom = options.callFrom || '_parseParamPath'; // function name to substitute in error message
    const {
      pathArr,
      paramPath: paramPath_,
      configName,
      pathParent,
      lastParamName
    } = this._parseParamPathFragment(paramPath, options);
    const schemaItem = this._getSchemaFragment(pathArr, this.schema, options);
    return {
      paramPath: paramPath_,
      pathArr: [...pathArr],
      pathParent,
      lastParamName: schemaItem[_isRootNode_] ? '__root__' : lastParamName,
      configName,
      schemaItem,
      schemaDataType: schemaItem.type
    };
  }

  // ###################################################################################################################################

  /**
   * Set new named configuration data and saves it to a file.
   * The default parameter structure is superimposed on the passed parameter structure.
   * Data is completely updated (old data is lost)
   *
   * @param {String} configName
   * @param {Object} configValue
   * @param {Boolean} refreshSchema - Values loaded from the previous config that are not in the
   * @param {Object} options
   *                            new one remain if the refreshSchema flag is specified
   */
  async _updateAndSaveNamedConfig (configName, configValue, refreshSchema = false, options = {}) {
    options.callFrom = options.callFrom || '_updateAndSaveNamedConfig'; // function name to substitute in error message
    if (refreshSchema) {
      await this.reloadSchema(); // VVQ сделать релод именованных конфигураций по отдельности
    }
    this._fillSchemaWithValues(configName, configValue, options);
    this._saveNamedConfig(configName);
  }

  // =============================== INIT ==================================

  async _reloadConfig (noReloadSchema = false) {
    this.configDir = Schema.getConfigDir();

    this._expectedConfigDir = this._expectedPath(this.configDir);
    if (!fs.existsSync(this.configDir)) {
      throw this._error(`Missing configuration directory: ${this._expectedConfigDir}`);
    }
    if (!fs.lstatSync(this.configDir).isDirectory()) {
      throw this._error(`The expected configuration directory is a file: ${this._expectedConfigDir}`);
    }
    if (!noReloadSchema) {
      await this.reloadSchema();
    }
    for (let i = 0; i < this.configNames.length; i++) {
      const configName = this.configName[i];
      const configValue = this._readNamedConfig(configName);
      await this._updateAndSaveNamedConfig(configName, configValue);
    }
  }

  // #######################################################################################################

  // =============================== DEFAULTS =================================

  /**
   * Creates and return a configuration defaults, populating with default values
   *
   * @param {schemaValueType} schemaValue
   * @param {Object} valuesContainer - for collecting properties
   * @param {String[]} pathArr
   * @return {Object} - reference configuration object
   */
  _getDefaults (schemaValue = undefined, valuesContainer = {}, pathArr = []) {
    if (!schemaValue) {
      schemaValue = this.schema?.value;
    }

    if (Array.isArray(schemaValue)) {
      schemaValue.forEach((schemaItem, index) => {
        const { id, value: childValue, defaultValue: childDefaultValue, type: schemaDataType } = schemaItem;

        const isSection = schemaDataType === 'section';

        const value = isSection ? childValue : childDefaultValue;

        if (value === undefined) {
          return;
        }
        if (value === null) {
          valuesContainer[id] = null;
          return;
        }

        this._validateSchemaItem(schemaItem, pathArr, index);

        if (isSection) {
          const sectionValue = this._getDefaults(value, valuesContainer[id], [...pathArr, id]);
          valuesContainer[id] = __.isNonEmptyObject(sectionValue) ? sectionValue : null;
          // Empty section values - null !!
        } else if (schemaDataType === 'array') {
          valuesContainer[id] = Array.isArray(childDefaultValue) ? value : null;
        } else if (schemaDataType === 'json') {
          valuesContainer[id] = this._normalizeJSON(value);
        } else {
          valuesContainer[id] = value;
        }
      });
    }
    return valuesContainer;
  }
};
