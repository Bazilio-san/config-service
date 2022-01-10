require('dotenv').config();
const path = require('path');

module.exports = async () => {
  process.env.NODE_CONFIG_DIR = path.resolve(`${__dirname}/../example/config`);
  process.env.NODE_ENV = 'test';
  process.env.LOGGER_LEVEL = 'debug';
  process.env.SUPPRESS_NO_CONFIG_WARNING = 1;
};
