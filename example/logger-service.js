/* eslint-disable import/no-extraneous-dependencies */

const { getAFLogger } = require('af-logger');

let globalLogger;

function getLogger () {
  if (!globalLogger) {
    const { logger } = getAFLogger({
      minLevel: 'silly',
      name: 'config-service'
    });
    globalLogger = logger;
  }
  return globalLogger;
}

module.exports = getLogger();
