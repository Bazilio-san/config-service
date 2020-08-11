/* eslint-disable max-len */

const path = require('path');
const fs = require('fs');
const __ = require('./lib.es6');
const Utils = require('./Utils.es6');

/*
The symbol properties of the Schema object are copied by the __. CloneDeep () function
And, thus, properties important for operation are transferred to localized copies of the Schema.
But when serialized, these properties disappear without clogging the copy of the Schema issued through the API
*/
const _isRootNode_ = Symbol.for('_isRootNode_');
const _parentSchemaItem_ = Symbol.for('_parentSchemaItem_');
const _isSection_ = Symbol.for('_isSection_');
const _isProp_ = Symbol.for('_isProp_');
const _value_ = Symbol.for('_value_');
const _lng_ = Symbol.for('_lng_');

/**
 * Path to configuration parameter
 *
 *  @typedef {String[]} propPathArrType
 *  array like ['prop1', 'prop2', 'prop3']
 */

/**
 * Path to configuration parameter
 *
 *  @typedef {String} propPathStrType
 *  String like 'prop1.prop2.prop3'
 */

/**
 * Path to configuration parameter
 *
 *  @typedef {propPathArrType|propPathStrType} propPathType
 */

/**
 * Data type in data schema
 *
 *  @typedef {('section'|'array'|'string'|'text'|'date'|'email'|'number'|'int'|'float'|'money'|'boolean')} schemaDataType
 */

/**
 * Schema properties
 *
 * @typedef {Object} schemaItemType
 * @property {String}          id      - ID of parameter
 * @property {schemaDataType}  type    - Schema data type
 * @property {String}          [title] - Default property title (in the absence of translation)
 * @property {String}          [t]     - title text resource ID
 * @property {schemaValueType} [value] - Property value or underlying structure
 */

/**
 * Property value or underlying structure
 *
 * @typedef {schemaItemType[]|*|null} schemaValueType
 */

/**
 * @typedef {schemaItemType|schemaValueType|null} schemaFragmentType
 */

module.exports = class Schema extends Utils {
    constructor (serviceOptions = {}) {
        super(serviceOptions);
        const { i18n, writeMissingTranslate, i18nNS = '', translatedProperties, onChange } = serviceOptions;
        this.onChange = typeof onChange === 'function' ? onChange : () => {
        };
        this.i18n = i18n;
        this.i18nNS = i18nNS ? `${i18nNS}:` : '';
        this.writeMissingTranslate = writeMissingTranslate;
        this.translatedProperties = [];
        if (translatedProperties && Array.isArray(translatedProperties)) {
            this.translatedProperties = translatedProperties.filter((v) => typeof v === 'string');
        }
        this.pathsOfSchemaItems = new Map();
        this.schemaByLanguageCache = new Map();
        this._reloadSchema();
    }

    /**
     * Returns true if the i18next module is initialized and the specified language is in the list of working languages
     * @param {String} lng
     * @return {boolean}
     * @private
     */
    _isLang (lng) {
        const { i18n } = this;
        if (!i18n || typeof i18n !== 'object' || typeof i18n.t !== 'function' || !i18n.options) {
            return false;
        }
        const languages = [...(i18n.options.preload || []), ...(i18n.languages || [])];
        return languages.includes(lng);
    }

    // =============================== SCHEMA =================================

    /**
     * Recursive movement along branches of a Schema with callback functions call
     *
     * @param {schemaFragmentType} schemaFragment
     * @param {Object} options
     * @param {Function} itemCallback
     * @param {Function} valueCallback
     * @return {null|Object}
     */
    _traverseSchema (schemaFragment, options = {}, itemCallback, valueCallback) {
        const cs = this;
        const { pathArr = [], itMustBeAn } = options;

        // eslint-disable-next-line camelcase,prefer-const
        let { id, value, type, [_isRootNode_]: isRoot, [_isSection_]: isSection, [_isProp_]: isProp } = schemaFragment || {};
        isSection = isSection || itMustBeAn === 'ITEM';
        isProp = isProp || itMustBeAn === 'PROPERTY';

        if (isRoot || isSection || isProp) {
            const lastPathElement = ([...pathArr].pop() || '');
            if (lastPathElement !== id) {
                if (!isRoot) {
                    options.pathArr.push(id);
                }
            }
            //
            let newOptions;
            if (typeof itemCallback === 'function') {
                newOptions = itemCallback.call(cs, schemaFragment, options); // { pathArr, index, itMustBeAn, + options from call traverseSchema }
            }
            //
            if (isSection) {
                cs._traverseSchema(value, {
                    ...(newOptions || options),
                    pathArr: [...pathArr],
                    itMustBeAn: type === 'section' ? 'VALUE' : 'PROPERTY'
                }, itemCallback, valueCallback);
            }
        } else if (itMustBeAn === 'VALUE') {
            if (schemaFragment == null || !schemaFragment.length) {
                return null;
            }
            if (!Array.isArray(schemaFragment)) { // Not used: validation is done in _validateSchemaItem
                throw this._error(`Value of section «${[...pathArr].join('.')}» mast be an array. Got «${schemaFragment}»`);
            }
            //
            if (typeof valueCallback === 'function') {
                valueCallback.call(cs, schemaFragment, options); // { pathArr, index, itMustBeAn, + options from call traverseSchema }
            }
            //
            schemaFragment.forEach((schemaItem, i) => {
                cs._traverseSchema(schemaItem, {
                    ...options,
                    pathArr: [...pathArr],
                    index: i,
                    itMustBeAn: schemaItem.type === 'section' ? 'ITEM' : 'PROPERTY'
                }, itemCallback, valueCallback);
            });
        }
        return schemaFragment;
    }

    /**
     * Validation of one schema item
     *
     * @param {schemaItemType} schemaItem
     * @param {propPathType} pathArr
     * @param {Number|null} paramIndex
     * @return {boolean}
     */
    _validateSchemaItem (schemaItem, pathArr, paramIndex = -1) {
        const { id, value, defaultValue = null, type: schemaDataType, title } = schemaItem;
        if (pathArr.length && !pathArr[pathArr.length - 1] && paramIndex !== -1) {
            pathArr[pathArr.length - 1] = `[${paramIndex}]`;
        }
        const paramPath = pathArr.join('.')
            .replace('.[', '[');
        const paramText = paramPath + (title ? ` (${title})` : '');
        if (!id) {
            throw this._error(`Parameter ID not specified for «${paramText}»`);
        }
        if (!schemaDataType) {
            throw this._error(`Parameter type not specified for «${paramText}»`);
        }
        if (!this._schemaDataTypeExists(schemaDataType)) {
            throw this._error(`Invalid type «${schemaDataType}» for parameter «${paramText}»`);
        }
        // Determine the type by value
        let realType = this._detectRealType(defaultValue);
        if (!this._validateType(realType, schemaDataType)) { // ? TEST
            throw this._error(`The real type «${realType}» of default value for param «${
                paramText}» found in Schema does not match schema data type «${schemaDataType}»`);
        }
        realType = this._detectRealType(value);
        if (!this._validateType(realType, schemaDataType)) { // ? TEST
            throw this._error(`The real type «${realType}» of value for param «${
                paramText}» found in Schema does not match schema data type «${schemaDataType}»`);
        }
        return true;
    }

    /**
     * Check new value
     * - if the value does not pass the test, an exception is thrown
     * - if undefined, returns the default value.
     *
     * @param {*} newValue -
     * @param {schemaItemType} schemaItem
     * @return {*}
     */
    validateNewValue (newValue, schemaItem) {
        const fnName = 'validateNewValue';
        const realType = this._detectRealType(newValue);
        // eslint-disable-next-line camelcase
        const { type, _paramPath: paramPath } = schemaItem;
        if (!this._validateType(realType, type)) {
            throw this._error(`The real type «${realType}» of value for «${paramPath}» not match schema data type «${type}»`);
        }
        if (newValue === undefined) {
            return undefined;
        }
        if (newValue === null) {
            return null;
        }

        const { validator } = this.types[type] || {};
        if (!validator) {
            throw this._error(`Validator function not found for type «${type}». Function «${fnName}»`);
        }
        const error = {};

        const normalized = validator(newValue, schemaItem, error, this);
        if (error.reason) {
            throw this._error(`Validation error of value for «${paramPath}». Reason: «${
                error.reason}». Schema data type: «${type}». New value: «${newValue}»`);
        }
        return normalized;
    }

    /**
     * A callback function that is called for each item of a Schema when
     * iterating through a new Schema in order to verify and normalize it.
     *
     * @param {schemaItemType} schemaItem
     * @param {propPathArrType} pathArr
     * @param {Number} index - index of the schemaItem in the 'section' array.
     *                          Used as an identifier for an error message
     *                          if the id property is missing in schemaItem
     * @private
     */
    __newSchemaItemCallback (schemaItem, { pathArr = [], index }) {
        this._validateSchemaItem(schemaItem, pathArr, index);
        const cs = this;
        const { t, title, type, value } = schemaItem;
        schemaItem[_lng_] = '';

        if (!schemaItem[_isRootNode_]) {
            const paramPath = pathArr.join('.');
            this.pathsOfSchemaItems.set(paramPath, schemaItem);
            if (t === undefined) {
                schemaItem.t = `${this.i18nNS}${[...pathArr, 'title'].join('.')}`;
            }
            if (title === undefined) {
                schemaItem.title = `Title of ${paramPath}`;
            }
            __.defineFinalHiddenProperty(schemaItem, '_pathArr', pathArr);
            if (type === 'section') {
                if (value == null) {
                    schemaItem.value = [];
                } else if (Array.isArray(value)) {
                    value.forEach((childSchemaItem) => {
                        childSchemaItem[_parentSchemaItem_] = schemaItem;
                    });
                }
            } else {
                /*
                Setting a getter and setter for the value property has 2 purposes:
                - in the setter, the handlers that fire when the value is set are attached.
                - we provide the operation of the Schema object in memory as a source of truth.
                 */
                schemaItem.defaultValue = value === undefined ? null : value;
                delete schemaItem.value;
                Object.defineProperty(schemaItem, 'value', {
                    get () {
                        return this[_value_] === undefined ? this.defaultValue : this[_value_];
                    },
                    set (newVal) {
                        const validated = cs.validateNewValue(newVal, schemaItem);
                        if (validated !== undefined) {
                            this[_value_] = validated;
                        }
                        cs.onChange(this._paramPath, validated, this, cs);
                    },
                    enumerable: true
                });
            }
        } else {
            __.defineFinalHiddenProperty(schemaItem, '_pathArr', []);
            this.pathsOfSchemaItems.set('', schemaItem);
            this.pathsOfSchemaItems.set(null, schemaItem);
            if (Array.isArray(value)) {
                value.forEach((childSchemaItem) => {
                    childSchemaItem[_parentSchemaItem_] = schemaItem;
                });
            }
        }
        Object.defineProperty(schemaItem, '_paramPath', {
            get () {
                return this._pathArr.join('.');
            },
            configurable: false,
            enumerable: false
        });
        if (type === 'section') {
            schemaItem[_isSection_] = true;
        } else {
            schemaItem[_isProp_] = true;
        }
    }

    /**
     * Normalizes the Schema.
     * - removes undefined properties
     * - sets getters/setters to 'value' properties
     *
     * @private
     * @param {schemaItemType} schema - Full Schema
     * @return {Object} - normalized value
     */
    _normalizeNewSchema (schema) {
        if (!schema[_isRootNode_]) {
            schema = {
                [_isRootNode_]: true,
                [_isSection_]: true,
                id: '__root__',
                type: 'section',
                title: 'Configuration root',
                t: `${this.i18nNS}__root__title`,
                value: schema
            };
        }
        const schemaClone = __.cloneDeepWithoutUndefined(schema);
        return this._traverseSchema(schemaClone, { pathArr: [] }, this.__newSchemaItemCallback);
    }

    /**
     * reload/download Schema.
     *
     * This flushes the Schema translation cache
     */
    _reloadSchema () {
        this.schemaDir = Utils.getSchemaDir();
        const expectedSchemaDir = this._expectedPath(this.schemaDir);
        if (!fs.existsSync(this.schemaDir)) {
            throw this._error(`Missing root configuration directory ${expectedSchemaDir}`);
        }

        const expectedSchemaFile = `${expectedSchemaDir}/schema.js`;
        this.schemaFile = path.resolve(`${this.schemaDir + path.sep}schema.js`);
        if (!fs.existsSync(this.schemaFile)) {
            throw this._error(`Missing Schema file «${expectedSchemaFile}»`);
        }
        let schema;
        try {
            this._deleteRequireCacheFor(this.schemaFile);
            // eslint-disable-next-line import/no-dynamic-require
            schema = require(this.schemaFile);
        } catch (err) {
            throw this._error(`Failed to load Schema file «${expectedSchemaFile}»`, err);
        }

        const isArray = Array.isArray(schema);
        if (!isArray) {
            throw this._error(`Schema «${this.schemaFile}» does not contain an array of schema items`);
        }
        if (!schema.length) {
            throw this._error(`Schema «${this.schemaFile}» contains no data`);
        }

        this.pathsOfSchemaItems.clear();

        this.schema = this._normalizeNewSchema(schema);
        this.configNames = this.schema.value.map(({ id }) => id);
    }

    // ================ TRANSLATION OF TITLES IN THE SCHEMA ===================

    /**
     * Translate Schema Item Title
     *
     * @param {schemaItemType} schemaItem
     * @param {Object} options
     */
    __fnTranslateSchemaItemTitleCallback (schemaItem, options) {
        const { i18n, lng, writeMissingTranslate = false, pathArr = [] } = options;
        const { t, type } = schemaItem;
        schemaItem[_lng_] = lng;
        const paramPath = pathArr.join('.');
        this.pathsOfSchemaItems.set(`${paramPath}:${lng}`, schemaItem);

        if (pathArr && type !== 'section') {
            const originalSchemaItem = this.pathsOfSchemaItems.get(paramPath);
            Object.defineProperty(schemaItem, 'value', {
                get () {
                    return originalSchemaItem.value === undefined
                        ? originalSchemaItem.defaultValue
                        : originalSchemaItem.value;
                }
            });
        }

        if (i18n) {
            const translationOptions = {
                id: schemaItem.id,
                lng
            };
            if (__.hasProp(schemaItem, 't')) {
                if (writeMissingTranslate) {
                    const translation = i18n.t(t, translationOptions);
                    let tPath = t;
                    const i = tPath.indexOf(':');
                    if (i > -1) {
                        tPath = tPath.substr(i + 1);
                    }
                    if (translation !== tPath) {
                        schemaItem.title = translation;
                    }
                } else if (i18n.exists(t, { lng })) {
                    schemaItem.title = i18n.t(t, translationOptions);
                }
            }
            this.translatedProperties.forEach((propName) => {
                const translationId = schemaItem[propName];
                if (translationId && (writeMissingTranslate || i18n.exists(translationId, { lng }))) {
                    schemaItem[propName] = i18n.t(translationId, translationOptions);
                }
            });
        }
    }

    /**
     * Returns a copy of the Schema object, where the 'title' properties are replaced with translations
     * in the 'lng' language.
     * If 'lng' is not in the list of available languages, a copy of the Schema 'as is' is returned
     * Takes data from the cache. If they are not there, first translates into the specified language,
     * writes to the cache and returns.
     *
     * @param {String} lng - translation language
     * @return {schemaItemType}
     * @private
     */
    _getSchemaByLanguage (lng) {
        if (!this._isLang(lng)) {
            return __.cloneDeep(this.schema);
        }
        if (this.schemaByLanguageCache.has(lng)) {
            return this.schemaByLanguageCache.get(lng);
        }
        const schemaClone = __.cloneDeep(this.schema);
        const _traverseOptions = {
            i18n: this.i18n,
            lng,
            writeMissingTranslate: this.writeMissingTranslate
        };
        this._traverseSchema(schemaClone, _traverseOptions, this.__fnTranslateSchemaItemTitleCallback);
        this.schemaByLanguageCache.set(lng, schemaClone);
        return schemaClone;
    }

    /**
     * Helper Function for _getTranslationTemplate
     *
     * @param {schemaItemType} schemaItem
     * @param {Object} container - the container in which the result is collected
     * @param {propPathType} pathArr
     * @param {Object} options - lng, onlyStandardPaths, addPaths
     * @private
     */
    __setOneTranslatedTemplateNode (schemaItem, container, pathArr, options) {
        const { root = {}, lng = '', onlyStandardPaths = true, addPaths = false } = options;
        const { i18n } = this;
        const { id, t } = schemaItem;
        const _id = id.replace(/\s/g, '__');
        options._id = _id;
        let { title } = schemaItem;
        const isRoot = schemaItem[_isRootNode_];
        const ns = isRoot ? '' : this.i18nNS;
        const standardPath = `${ns}${[...pathArr, _id, 'title'].join('.')}`;
        if (t !== standardPath && (!onlyStandardPaths || isRoot)) {
            let current = root;
            const trPath = (isRoot ? t.replace(/^[^:]+:/, '') : t).split(/[:.]/);
            while (trPath.length) {
                const left = trPath.shift();
                if (!__.isObject(current[left])) {
                    current[left] = {};
                }
                if (trPath.length) {
                    current = current[left];
                } else {
                    if (i18n && i18n.exists(t, { lng })) {
                        title = i18n.t(t, { lng });
                    }
                    current[left] = title;
                    if (addPaths) {
                        current.t = t;
                    }
                }
            }
        } else {
            if (i18n && i18n.exists(t, { lng })) {
                title = i18n.t(t, { lng });
            }
            container[_id] = { title };
            if (addPaths) {
                container[_id].t = standardPath;
            }
        }
    }

    /**
     * Returns a translation template
     *
     * @param {schemaValueType} schemaValue
     * @param {Object} container - the container in which the result is collected
     * @param {propPathType} pathArr
     * @param {Object} options - lng, onlyStandardPaths, addPaths
     * @return {Object}
     * @private
     */
    _getTranslationTemplate ({ schemaValue = this.schema, container = {}, pathArr = [] }, options) {
        if (schemaValue && schemaValue[_isRootNode_]) {
            this.__setOneTranslatedTemplateNode(schemaValue, container, pathArr, options);
            schemaValue = schemaValue.value;
        }
        if (Array.isArray(schemaValue)) {
            schemaValue.forEach((schemaItem) => {
                if (__.isSchemaItem(schemaItem)) {
                    this.__setOneTranslatedTemplateNode(schemaItem, container, pathArr, options);
                    const { _id } = options;
                    this._getTranslationTemplate({
                        schemaValue: schemaItem.value,
                        container: container[_id],
                        pathArr: [...pathArr, _id]
                    }, options);
                }
            });
        }
        return container;
    }

    // ========================== USED IN CHILD CLASSES =======================

    /**
     * Returns a fragment of a Schema at the specified path
     *
     * @param {propPathArrType} propPath
     * @param {schemaItemType} schemaItem
     * @param {String} fnName - function name to substitute in error message
     * @return {schemaItemType}
     */
    _getSchemaFragment (propPath, schemaItem, fnName) {
        const { paramPath, pathArr } = this._parseParamPathFragment(propPath);
        if (!schemaItem) {
            schemaItem = this.schema;
        }
        if (!__.isNonEmptyObject(schemaItem)) {
            throw this._error(`Argument «schemaItem» is empty or either not an object or an empty object. Path: «${paramPath}» Function «${fnName}»`);
        }

        const fullPathArr = [...(schemaItem._pathArr || []), ...pathArr];
        const lng = schemaItem[_lng_] || '';
        const fullPath = fullPathArr.join('.') + (lng ? `:${lng}` : '');
        if (!this.pathsOfSchemaItems.has(fullPath)) {
            const where = schemaItem._paramPath
                ? `in the Schema fragment «${schemaItem._paramPath}»`
                : 'in the Schema';
            throw this._error(`No such parameter «${paramPath}» ${where}. Function «${fnName}»`);
        }
        return this.pathsOfSchemaItems.get(fullPath);
    }
};
