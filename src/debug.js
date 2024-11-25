const { Debug } = require('af-tools-ts');
const { bold, reset, red } = require('af-color');

const debugCS = Debug('config-service', {
  noTime: false,
  noPrefix: false,
  prefixColor: bold + red,
  messageColor: reset,
});

module.exports = debugCS;
