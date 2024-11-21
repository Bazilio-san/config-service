const { initLogger } = require('./logger');

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

    const { logger } = instance || {};
    this.logger = initLogger({
      logger,
      scope: 'ConfigServiceError',
    });
    const isTesting = process.env.NODE_ENV === 'testing';
    if (isTesting) {
      this.logger.info('\x1b[103;30m==================== expected test error ======================\x1b[0m');
    }
    this.logger.error(msg, err);
  }
}

module.exports = ConfigServiceError;
