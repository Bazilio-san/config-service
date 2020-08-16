/* eslint-disable class-methods-use-this, max-len */

const path = require('path');
const __ = require('./lib.es6');
const standardTypes = require('./types.es6');

const { DEFAULT_SCHEMA_DIR, DEFAULT_CONFIG_DIR } = require('./constants.es6');

const ConfigServiceError = require('./ConfigServiceError.es6');

module.exports = class Utils {
    constructor (serviceOptions = {}) {
        const { errorLogger, _afLibEcho, userTypes } = serviceOptions;
        /**
         * @param {Object} [_afLibEcho] - An object that provides the 'mErr' method, which prints an error message
         * to the console and passes the message to errorLogger
         */
        this._afLibEcho = _afLibEcho;
        /**
         * @param {Object} [errorLogger] - An object that provides the 'error' method,
         * which saves an error message to the log
         */
        this.errorLogger = errorLogger && typeof errorLogger === 'function' ? errorLogger : null;
        this.registerTypes(userTypes);
    }

    /**
     * Returns the full path to the directory from where the service will take the Schema file
     * @return {String}
     */
    static getSchemaDir () {
        let schemaDir = __.getCmdOrEnv(
            'NODE_CONFIG_SERVICE_SCHEMA_DIR',
            path.join(process.cwd(), DEFAULT_SCHEMA_DIR)
        );
        if (schemaDir.indexOf('.') === 0) {
            schemaDir = path.join(process.cwd(), schemaDir);
        }
        return schemaDir;
    }

    /**
     * Returns the full path to the directory from where the service will take named configuration files
     * @return {string}
     */
    static getConfigDir () {
        const configDir = __.getCmdOrEnv('NODE_CONFIG_SERVICE_DIR', DEFAULT_CONFIG_DIR);
        if (/[\\/]/.test(configDir) && path.isAbsolute(configDir)) {
            return path.resolve(configDir);
        }
        return path.resolve(Utils.getSchemaDir() + path.sep + configDir);
    }

    // =============================== UTILS =================================

    _expectedPath (path_) {
        return path_.replace(process.cwd(), '<proj_root>').replace(/\\/g, '/');
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

    /**
     * Clearing cache require
     */
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

    /**
     * Normalizes json by removing undefined properties
     *
     * @param {*} json
     * @param {String} propPath
     * @return {*} - normalized value
     */
    _normalizeJSON (json, propPath = null) {
        if (!json) {
            return json;
        }
        try {
            return JSON.parse(JSON.stringify(json));
        } catch (err) {
            const msg = propPath ? ` for parameter «${propPath}»` : '';
            throw this._error(`Cannot normalize JSON value${msg}. Error: ${err.message}`, err);
        }
    }

    // =============================== SCHEMA ITEM TYPES =================================

    registerTypes (userTypes) {
        const types = __.cloneDeep(standardTypes);
        if (__.isNonEmptyObject(userTypes)) {
            __.each(userTypes, ({ jsTypes = ['any'], validator = () => {} }, userTypeName) => {
                if (jsTypes && Array.isArray(jsTypes)) {
                    jsTypes = jsTypes.filter((v) => ['any', 'null', 'object', 'array', 'string', 'number', 'boolean'].includes(v));
                    if (jsTypes.length) {
                        if (!__.hasProp(types, userTypeName)) {
                            types[userTypeName] = {};
                        }
                        types[userTypeName].jsTypes = jsTypes;
                    }
                }
                if (validator && typeof validator === 'function') {
                    if (!__.hasProp(types, userTypeName)) {
                        types[userTypeName] = {};
                    }
                    types[userTypeName].validator = validator;
                }
                if (types[userTypeName] && !types[userTypeName].validator) {
                    types[userTypeName].validator = (newValue, defaultValue = null) => (newValue === undefined ? defaultValue : newValue);
                }
            });
        }
        this.types = types;
    }

    /**
     * Checking the correspondence between the type of real data and the type from the Schema
     *
     * @param {String} realType
     * @param {String} schemaDataType
     * @return {boolean}
     */
    _validateType (realType, schemaDataType) {
        if (realType === 'undefined') {
            return true;
        }
        if (!realType || !schemaDataType) {
            return false;
        }
        const { jsTypes } = this.types[schemaDataType] || {};
        if (!jsTypes) {
            return false;
        }
        return !!jsTypes && (jsTypes.includes('any') || jsTypes.includes(realType));
    }

    /**
     * Checks if the schema data type is registered
     *
     * @param {String} schemaDataType
     * @return {boolean}
     */
    _schemaDataTypeExists (schemaDataType) {
        return __.hasProp(this.types, schemaDataType);
    }

    /**
     * Detects the actual data type.
     *
     * @param {*} value
     * @return {String}
     */
    _detectRealType (value) {
        if (value === null) {
            return 'null';
        }
        let type = typeof value;
        if (type === 'object' && Array.isArray(value)) {
            type = 'array';
        }
        return type;
    }

    /**
     * Checking the correspondence between the type of real data and the type from the Schema
     *
     * @private
     * @param {*} realValue
     * @param {String} schemaDataType
     * @return {boolean}
     */
    _validateValueByType (realValue, schemaDataType) {
        return this._validateType(this._detectRealType(realValue), schemaDataType);
    }

    /**
     * Returns a list of expected types for the passed schema data type
     * Used in error messages
     *
     * @param {schemaDataType} schemaDataType
     * @return {String}
     */
    _getExpectedRealTypesString (schemaDataType) {
        const { jsTypes } = this.types[schemaDataType] || {};
        if (!jsTypes) {
            throw this._error(`Invalid type «${schemaDataType}» passed in function «_getExpectedRealTypesString»`);
        }
        return `Expected: «${jsTypes.join(',')}»`;
    }

    /**
     * Parses the path to the parameter, checking and normalizing it.
     * Returns the path as a string representation and as an array.
     *
     * @param {propPathType} propPath
     * @param {String}fnName
     * @return {Object}
     */
    _parseParamPathFragment (propPath, fnName = '_parseParamPathFragment') {
        propPath = propPath || '';
        const isValid = typeof propPath === 'string'
            || (Array.isArray(propPath) && !propPath.some((v) => typeof v !== 'string'));

        if (!isValid) {
            throw this._error(`Parameter path is not a string or array of strings: «${String(propPath)}». Function «${fnName}»`);
        }
        const paramPath = typeof propPath === 'string' ? propPath : propPath.join('.');
        if (!Array.isArray(propPath)) {
            propPath = paramPath.split('.').filter((v) => `${v}`.trim());
        }
        const configName = propPath.length ? propPath[0] : '';
        const pathParent = [...propPath];
        const lastParamName = pathParent.length ? pathParent.pop() : '';

        return {
            paramPath,
            pathArr: propPath,
            configName,
            pathParent,
            lastParamName
        };
    }

    /**
     * Expose method cloneDeep from lib.
     *
     * @param {Array} args
     * @return {Object}
     */
    cloneDeep (...args) {
        return __.cloneDeep(...args);
    }
};
