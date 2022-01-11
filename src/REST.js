/* eslint-disable class-methods-use-this, max-len, max-classes-per-file, no-prototype-builtins, no-bitwise */

const path = require('path');
const fs = require('fs');
const __ = require('./lib.js');
const API = require('./API.js');

const addSocketListeners = ({ socket, debug, prefix, configService }) => {
  const debugSocket = typeof debug === 'function'
    ? debug('config-service:socket')
    : () => {
    };

  if (typeof socket.applyFn !== 'function') {
    socket.getCallback = (args) => {
      if (!args) {
        return;
      }
      if (typeof args === 'function') {
        return args;
      }
      if (Array.isArray(args)) {
        return args.find((v) => typeof v === 'function');
      }
    };

    socket.callBack = (fn, args2) => {
      if (!Array.isArray(args2)) {
        args2 = [args2];
      }
      return fn.apply(socket, args2);
    };

    socket.applyFn = (args, args2) => {
      const fn = socket.getCallback(args);
      if (fn) {
        return socket.callBack(fn, args2);
      }
    };
  }

  if (configService.accessToken) {
    const inToken = (socket?.handshake?.headers?.authorization ?? '').replace(/^Bearer +/, '');
    if (configService.accessToken !== inToken) {
      const msg = 'Authentication error. Invalid token';
      socket.prependAny(async (event, ...packetDecoded) => {
        if (event.startsWith(`${prefix}/`)) {
          debugSocket(`${msg}: ${inToken}`);
          socket.applyFn(packetDecoded, msg);
        }
      });
      return;
    }
  }

  /**
   * @param {any[]} args
   * @param {any} result
   * @returns {ISocketReturn<any>}
   */
  function applyResult (args, result) {
    const ret = { result };
    socket.applyFn(args, { result });
    return ret;
  }

  /**
   * @param {any[]} args
   * @param {string} error
   * @returns {ISocketReturn<string>}
   */
  function applyError (args, error) {
    const ret = { error };
    socket.applyFn(args, { error });
    return ret;
  }

  function doit (fnName, argsFn, args) {
    let result;
    try {
      result = configService[fnName](argsFn);
      socket.applyFn(args, { result });
    } catch (err) {
      socket.applyFn(args, { error: err.message });
    }
  }

  socket.on(`${prefix}/get-schema`, async (request = {}, ...args) => {
    const lng = (request.lng || '').substr(0, 2).toLowerCase();
    debugSocket(`GET SCHEMA: lng = ${lng}`);
    doit('getSchema', [request.propPath, lng], args);
  });

  socket.on(`${prefix}/get-ex`, async (request, ...args) => {
    const { propPath } = request;
    debugSocket(`GET EX: propPath = ${propPath}`);
    doit('getEx', [propPath], args);
  });

  socket.on(`${prefix}/get`, async (request, ...args) => {
    const { propPath } = request;
    debugSocket(`GET: propPath = ${propPath}`);
    doit('get', [propPath], args);
  });

  socket.on(`${prefix}/set`, async (request, ...args) => {
    const { propPath, paramValue, callerId = socket.id } = request;
    debugSocket(`SET: ${propPath} = ${JSON.stringify(paramValue)}`);
    doit('get', [propPath, paramValue, { callerId }], args);
  });

  socket.on(`${prefix}/params-list`, async ({ node, isExtended = false }, ...args) => {
    debugSocket(`GET: plainParamsList / node = ${node}`);
    doit('get', [node, { isExtended }], args);
  });
};

const isIoBroadcastDecoratorSymbol = Symbol.for('isIoBroadcastDecorator');

module.exports = class REST extends API {
  constructor (serviceOptions = {}) {
    super(serviceOptions);
    let { serviceUrlPath } = serviceOptions;
    serviceUrlPath = (`/${serviceUrlPath || ''}`).replace(/[/\\]+/g, '/').replace(/\/+$/, '');
    if (!serviceUrlPath.replace('/', '')) {
      serviceUrlPath = '/config-service';
    }
    this.serviceUrlPath = serviceUrlPath;
    this.accessToken = serviceOptions.accessToken;
    this.testPathRe = new RegExp(`^${this.serviceUrlPath}([^\\d\\w ]|)`);
    this.rest = this.rest.bind(this);

    // SOCKET IO

    const { prefix = 'cs', debug, broadcast: { throttleMills, extended } = {} } = serviceOptions.socketIoOptions || {};

    this.initSocket = ({ socket }) => addSocketListeners({ socket, debug, prefix, configService: this });
    const debugIO = typeof debug === 'function'
      ? debug('config-service:io')
      : () => {
      };
    const emitId = `broadcast/${prefix}/param-changed`;

    this.initSocketBroadcast = (io) => {
      let broadcast = (data) => {
        const { paramPath, oldValue, newValue, isJustInitialized, schemaItem, callerId } = data;
        const response = { paramPath, oldValue, newValue, isJustInitialized, callerId };
        if (extended && schemaItem.type !== 'section') {
          response.schemaItem = this.cloneDeep(schemaItem, { pureObj: true, removeSymbols: true });
        }
        debugIO(`[${emitId}]: path: ${paramPath}, value: ${newValue}`);
        io.emit(emitId, response);
      };
      if (throttleMills) {
        broadcast = __.throttle(broadcast, throttleMills);
      }
      const configService = this;

      function broadcastDecorator (onChange) {
        function wrapper (data) {
          broadcast(data);
          if (typeof onChange === 'function') {
            return onChange.call(configService, data);
          }
        }

        wrapper[isIoBroadcastDecoratorSymbol] = true;
        return wrapper;
      }

      if (!this.onChange || !this.onChange[isIoBroadcastDecoratorSymbol]) {
        this.onChange = broadcastDecorator(this.onChange);
      }
    };
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
        help: `${this.serviceUrlPath}/help`
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
    if (req.path === `${this.serviceUrlPath}/help`) {
      return this._help(res, 200);
    }
    if (!this.testPathRe.test(req.path)) {
      next();
      return;
    }

    if (this.accessToken) {
      const inToken = (req.headers.authorization || '').replace(/^Bearer +/i, '');
      if (!inToken) {
        res.status(400).send('missing authorization header');
        return;
      }
      if (inToken !== this.accessToken) {
        res.status(401).send('Invalid token');
        return;
      }
    }

    const { query } = req;

    const {
      get: getValue,
      'get-ex': getValueEx,
      set: setValue,
      list: getConfigList,
      lng,
      'translation-template': translationTemplate
    } = query;
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
      const options = /\bnoonchange\b/im.test(req.url) ? { onChange: false } : {};
      return this._httpCall(this.set, { args: [paramPath, paramValue, options], req, res });
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
      const paramPath = plainParamsList;
      return this._httpCall(this.plainParamsList, { args: [paramPath], req, res });
    }
    if (plainParamsListEx !== undefined) {
      if (plainParamsListEx === '.') {
        plainParamsListEx = '';
      }
      const paramPath = plainParamsListEx;
      return this._httpCall(this.plainParamsList, { args: [paramPath, { isExtended: true }], req, res });
    }
    if (translationTemplate !== undefined) {
      if (!req.body) {
        return this._httpErr500(res, 'Missing request body');
      }
      const options = typeof req.body === 'object' ? req.body : {};
      return this._httpCall(this.getTranslationTemplate, { args: [options], req, res });
    }

    return this._invalidRequest(res);
  }
};
