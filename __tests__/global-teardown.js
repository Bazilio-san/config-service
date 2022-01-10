require('dotenv').config();
const { clearTestEnv } = require('./test-utils.js')({ __dirname });
const { fileLogger } = require('../example/logger-service.js');

module.exports = async () => {
  clearTestEnv();
  fileLogger.loggerFinish(0);
};
