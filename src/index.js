const Utils = require('./Utils.js');
const Schema = require('./Schema.js');
const Params = require('./Params.js');
const API = require('./API.js');
const REST = require('./REST.js');

let globalRESTInstance;

const getRESTInstance = (serviceOptions) => {
  if (globalRESTInstance && globalRESTInstance instanceof REST) {
    return globalRESTInstance;
  }
  return new REST(serviceOptions);
};

module.exports = {
  Utils,
  Schema,
  Params,
  API,
  REST,
  getRESTInstance
};
