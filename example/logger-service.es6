/* eslint-disable import/no-extraneous-dependencies */

const Logger = require('af-logger');

const loggerOptions = {
    prefix: '',
    errorPrefix: 'error-',
    suffix: 'config-service',
    removeEmptyErrorFiles: true,
    removeEmptyLogFiles: true
};

let globalLogger;

function getLogger () {
    if (!globalLogger) {
        globalLogger = new Logger(loggerOptions);
    }
    return globalLogger;
}

module.exports = getLogger();
