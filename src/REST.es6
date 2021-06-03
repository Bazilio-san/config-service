/* eslint-disable class-methods-use-this, max-len, max-classes-per-file, no-prototype-builtins, no-bitwise */

const path = require('path');
const fs = require('fs');
const __ = require('./lib.es6');
const API = require('./API.es6');

module.exports = class REST extends API {
    constructor (serviceOptions = {}) {
        super(serviceOptions);
        this.rest = this.rest.bind(this);
    }

    /**
     * Helper Function Returning 500 HTTP Error
     *
     * @param {Object} res
     * @param {String} message
     * @param {Error|Object} err
     * @private
     */
    _httpErr500 (res, message, err = {}) {
        if (!__.isNonEmptyObject(err)) {
            this._error(message, err);
            delete err.stack;
        }
        __.filterObj(err, (v) => !!v);
        res.status(500).send({
            err: {
                ...err,
                message,
                name: 'ConfigServiceError',
                help: '/config-service/help'
            }
        });
    }

    /**
     * Helper function between REST-API and API.
     * Calls an API method by its name.
     *
     * @param {Function} method
     * @param {Object} options
     * @private
     */
    _httpCall (method, options) {
        const { res, args } = options;
        try {
            const json = method.apply(this, args);
            res.type('json');
            res.send(json);
        } catch (err) {
            this._httpErr500(res, err.message, err);
        }
    }

    /**
     * Returns Help
     *
     * @param {Object} res
     * @param {Number} code - HTTP code that accompanies the response
     * @private
     */
    _help (res, code = 500) {
        res.header('Content-Type', 'text/markdown');
        const readMe = path.resolve(path.join(__dirname, 'help.md'));
        res.status(code).send(fs.readFileSync(readMe));
    }

    /**
     * Returns link to Help
     *
     * @param {Object} res
     * @private
     */
    _invalidRequest (res) {
        res.type('json');
        this._httpErr500(res, 'Invalid request');
    }

    getRest (paramPath) {
        return { value: this.get(paramPath) };
    }

    /**
     * Router between REST API and API
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next - callback
     * @return {void}
     */
    rest (req, res, next) {
        if (req.path === '/config-service/help') {
            return this._help(res, 200);
        }
        if (!/^\/config-service([^\d\w ]|)/.test(req.path)) {
            next();
            return;
        }
        const { query } = req;

        const { get: getValue, 'get-ex': getValueEx, set: setValue, list: getConfigList, lng } = query;
        let {
            'get-schema': getSchema,
            'plain-params-list': plainParamsList,
            'plain-params-list-ex': plainParamsListEx
        } = query;

        if (getValue !== undefined) {
            return this._httpCall(this.getRest, { args: [getValue], req, res });
        }

        if (getValueEx !== undefined) {
            return this._httpCall(this.getEx, { args: [getValueEx], req, res });
        }

        if (setValue !== undefined) {
            if (!setValue) {
                return this._httpErr500(res, `Passed empty parameter value «set»`);
            }
            const paramPath = setValue;
            if (!req.body) {
                return this._httpErr500(res, 'Missing request body');
            }
            if (req.body.value === undefined) {
                return this._httpErr500(res, `No root parameter «value» was found. Expected {value: <new value>}`);
            }
            const paramValue = req.body.value;
            return this._httpCall(this.set, { args: [paramPath, paramValue], req, res });
        }
        if (getSchema !== undefined) {
            if (getSchema === '.') {
                getSchema = '';
            }
            return this._httpCall(this.getSchema, { args: [getSchema, lng], req, res });
        }
        if (getConfigList !== undefined) {
            return this._httpCall(this.list, { args: [], req, res });
        }
        if (plainParamsList !== undefined) {
            if (plainParamsList === '.') {
                plainParamsList = '';
            }
            return this._httpCall(this.plainParamsList, { args: [plainParamsList], req, res });
        }
        if (plainParamsListEx !== undefined) {
            if (plainParamsListEx === '.') {
                plainParamsListEx = '';
            }
            return this._httpCall(this.plainParamsList, { args: [plainParamsListEx, true], req, res });
        }

        return this._invalidRequest(res);
    }
};
