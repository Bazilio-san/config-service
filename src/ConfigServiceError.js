class ConfigServiceError extends Error {
  /**
   * writes an error message to the console and to the log (if there is an error logger object)
   *
   * @param {String} msg
   * @param {Error} [err]
   * @param {Utils|Schema|Params|API|REST} instance
   * @return {void}
   */
  constructor (msg, err, instance) {
    super(msg);
    this.name = 'ConfigServiceError';

    const { _afLibEcho, errorLogger } = instance || {};
    const isTesting = process.env.NODE_ENV === 'test';
    if (isTesting) {
      // eslint-disable-next-line no-console
      console.log('\x1b[103;30m==================== expected test error ======================\x1b[0m');
    }
    if (_afLibEcho) {
      _afLibEcho.mErr(err, {
        msg,
        errorLogger,
        noStack: isTesting && !process.env.CS_ERROR_SHOW_STACK,
      });
    } else if (errorLogger) {
      errorLogger.error(msg);
    } else {
      let cMsg = `\x1b[31m${msg}`;
      if (err) {
        if (err.message) {
          cMsg += ` >>> \n${err.message}`;
        }
        if (err.stack) {
          cMsg += ` >>> \n${err.stack}`;
        }
      }
      cMsg += `\x1b[0m`;
      // eslint-disable-next-line no-console
      console.log(cMsg);
    }
  }
}

module.exports = ConfigServiceError;
