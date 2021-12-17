const REST = require('./REST.js');

let globalInstance;

module.exports = (serviceOptions) => {
  if (globalInstance && globalInstance instanceof REST) {
    return globalInstance;
  }
  return new REST(serviceOptions);
};
