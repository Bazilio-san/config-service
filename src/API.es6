/* eslint-disable class-methods-use-this, max-len, max-classes-per-file, no-prototype-builtins, no-bitwise */

const __ = require('./lib.es6');
const Params = require('./Params.es6');

const _isRootNode_ = Symbol.for('_isRootNode_');
const _parentSchemaItem_ = Symbol.for('_parentSchemaItem_');

module.exports = class API extends Params {
    constructor (serviceOptions = {}) {
        super(serviceOptions);
    }

    // noinspection JSCommentMatchesSignature
    /**
     * Save a parameter value at a given path
     *
     * During the storage process, checks are carried out on the validity of the stored data:
     * - matching types specified in the Schema
     * - the presence of Schemas for the transferred properties
     * In case of discrepancies, an error is generated.
     *
     * @param {propPathType} paramPath
     * @param {any} paramValue
     * @return {boolean}
     */
    set (paramPath, paramValue, ...args) {
        const callFrom = args[0] || 'set';
        const {
            pathArr,
            configName
        } = this._parseParamPathFragment(paramPath, callFrom);
        if (!configName) {
            throw this._error(`The path must begin with a named configuration identifier. Function «${callFrom}»`);
        }
        if (!this.configNames.includes(configName)) {
            throw this._error(`There is no named configuration «${configName}» in the schema. Function «${callFrom}»`);
        }
        this._fillSchemaWithValues(pathArr, paramValue, callFrom);
        this._saveNamedConfig(configName);
        return true;
    }

    // noinspection JSCommentMatchesSignature
    /**
     * Get the value of a configuration parameter along its path
     * The parameter value is passed in the property 'paramValue' of the object
     * and is accompanied by additional information:
     *      defaultValue,
     *      isNamedConfig,
     *      paramName,
     *      paramPath,
     *
     * @param {propPathType} paramPath
     * @return {*}
     */
    getEx (paramPath, ...args) {
        const callFrom = args[0] || 'get';
        const {
            paramPath: paramPath_,
            pathArr,
            lastParamName,
            schemaItem
        } = this._parseParamPath(paramPath, callFrom);
        const parentSchemaItem = schemaItem[_parentSchemaItem_];
        const configValuesFromSchema = this._getValues(pathArr);
        const result = {
            value: configValuesFromSchema,
            defaultValue: __.get(this.defaults, pathArr),
            paramPath: paramPath_,
            paramName: lastParamName
        };
        if (schemaItem[_isRootNode_]) {
            result.isRoot = true;
        } else if (parentSchemaItem && parentSchemaItem[_isRootNode_]) {
            result.isNamedConfig = true;
        }
        return result;
    }

    /**
     * Get the value of a configuration parameter along its path
     * Unlike the getEx method, this function returns value as is, without additional information.
     *
     * @param {propPathType} paramPath
     * @return {*}
     */
    get (paramPath) {
        return this._getValues(paramPath, 'get');
    }

    /**
     * Synonym for get.
     *
     * @param {propPathType} paramPath
     * @return {*}
     */
    value (paramPath) {
        return this._getValues(paramPath, 'value');
    }

    /**
     * Returns a Schema for the specified parameter path.
     * If the first argument is empty, the entire schema is returned.
     * If the second argument is passed - 'lng', then the 'title' properties are replaced with
     * localized headers in accordance with the value of the 't' parameter (if specified)
     *
     * @param {propPathType} propPath
     * @param {String} lng - translation language
     * @return {schemaItemType}
     */
    getSchema (propPath, lng) {
        const callFrom = 'getSchema';
        const localizedSchema = this._getSchemaByLanguage(lng);
        if (!propPath) {
            return localizedSchema;
        }
        const {
            paramPath,
            pathArr
        } = this._parseParamPathFragment(propPath, callFrom);
        const schemaItemLocalized = this._getSchemaFragment(pathArr, localizedSchema, callFrom);
        if (!__.isSchemaItem(schemaItemLocalized)) {
            throw this._error(`Failed to get translated schema. Path: «${paramPath}». Function «${callFrom}»`);
        }
        return schemaItemLocalized;
    }

    /**
     * Returns a list of named configuration IDs
     * @return {String[]}
     */
    list () {
        return this.configNames;
    }

    /**
     * Simple parameter data { path, value }
     *
     * @typedef {Object} propSimpleType
     * @property {propPathStrType} path - parameter path
     * @property {schemaValueType} value - parameter value
     */

    /**
     * Extended parameter data { id, path, type, value, defaultValue ...<other schema item properties> }
     *
     * @typedef {Object} propExtendedType
     */

    /**
     * Returns plain list of parameters, which types is not "section" as Simple or Extended parameter data
     *
     * @param {propPathStrType} paramPath
     * @param {Boolean} isExtended
     * @return {propSimpleType[]|propExtendedType[]}
     */
    plainParamsList (paramPath, isExtended = false) {
        const callFrom = 'plainParamsList';
        const { schemaItem } = this._parseParamPath(paramPath, callFrom);

        const propList = [];
        const traverseOptions = {};

        const propertyCallback = (propertyTypeSchemaItem) => {
            const { path, value } = propertyTypeSchemaItem;
            const prop = isExtended
                ? this.cloneDeep(propertyTypeSchemaItem, { removeSymbols: true, pureObj: true })
                : { path, value };
            propList.push(prop);
        };
        this.traverseSchema(schemaItem, traverseOptions, null, null, propertyCallback);

        return propList;
    }

    /**
     * Schema properties
     *
     * @typedef  {Object}  getTranslationTemplateOptionsType
     * @property {String}  lng                        - language id
     * @property {Boolean} [onlyStandardPaths = true] -
     *           If `onlyStandardPaths = false` - the paths for translation id specified in
     *           the scheme will be added to the resulting object,
     *           even if they differ from the standard ones.
     *           For example:
     *           for the `config1.div13.v_json = {t: 'cs: config1.vjson.title'}` property,
     *           the `cs:config1.vjson.title` property will be created.
     *           If `onlyStandardPaths = true` is specified, only
     *           then the standard property `config1.div13.v_json.title` will be created.
     * @property {Boolean} [addPaths = false] -
     *           If `addPaths = true` - next to the title property is
     *           placed the `t` property containing the translation id.
     *           This is convenient to use by immediately copying and
     *           substituting the translation identifier in the code.
     */

    /**
     * Returns a translation template
     *
     * @param {getTranslationTemplateOptionsType} options
     * @return {Object}
     */
    getTranslationTemplate (options) {
        options.root = {};
        return this._getTranslationTemplate({ container: options.root }, options);
    }
};
