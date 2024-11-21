class BaseLogger {
  constructor (scope) {
    this.super();
    this._scope = scope;
  }

  info (msg) {
    const msgWithTimestring = this._addTimestring(this._addScope(msg));
    console.info(msgWithTimestring);
  }

  warn (msg) {
    const msgWithTimestring = this._addTimestring(this._addScope(msg));
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
    const msgWithTimestring = this._addTimestring(this._addScope(cMsg));
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
}

const initLogger = (payload) => {
  const { logger, scope } = payload;
  return logger ?? new BaseLogger(scope);
};

module.export = { initLogger };
