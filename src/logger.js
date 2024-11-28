const { Debug } = require('af-tools-ts');
const { bold, reset, red } = require('af-color');

const debugCS = Debug('config-service', {
  noTime: false,
  noPrefix: false,
  prefixColor: bold + red,
  messageColor: reset,
});

class BaseLogger {
  constructor (scope) {
    this._service = 'config-service';
    this._scope = scope;
  }

  // eslint-disable-next-line class-methods-use-this
  info (msg, payload = '') {
    const message = payload ? `${msg} - payload: ${JSON.stringify(payload)}` : msg;
    debugCS(this._addScope(message));
  }

  warn (msg) {
    const msgWithTimestring = this._addTimestring(this._addServiceName(this._addScope(msg)));
    console.warn(msgWithTimestring);
  }

  error (msg, error) {
    let cMsg = `\x1b[31m${msg}`;
    if (error) {
      if (error.message) {
        cMsg += ` >>> \n${error.message}`;
      }
      if (error.stack) {
        cMsg += ` >>> \n${error.stack}`;
      }
    }
    cMsg += `\x1b[0m`;
    const msgWithTimestring = this._addTimestring(this._addServiceName(this._addScope(cMsg)));
    console.error(msgWithTimestring);
  }

  // eslint-disable-next-line class-methods-use-this
  _addTimestring (msg) {
    return `[${new Date().toLocaleTimeString()}] ${msg}`;
  }

  // eslint-disable-next-line class-methods-use-this
  _addScope (msg) {
    return this._scope ? `${this._scope}: ${msg}` : msg;
  }

  // eslint-disable-next-line class-methods-use-this
  _addServiceName (msg) {
    return this._service ? `${this._service}: ${msg}` : msg;
  }
}

const initLogger = (payload = {}) => {
  const { logger, scope } = payload;
  return logger ?? new BaseLogger(scope);
};

module.exports = { initLogger };
