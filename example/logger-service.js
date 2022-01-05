/* eslint-disable import/no-extraneous-dependencies */

const { getAFLogger } = require('af-logger');

let globalLogger;

function getLogger () {
  if (!globalLogger) {
    globalLogger = getAFLogger({
      minLevel: 'silly',
      name: 'config-service'
    });
  }
  return globalLogger;
}

module.exports = getLogger();
