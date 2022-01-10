const Utils = require('./Utils.js');
const Schema = require('./Schema.js');
const Params = require('./Params.js');
const API = require('./API.js');
const REST = require('./REST.js');

let globalRESTInstance;

const getRESTInstance = (serviceOptions, forceNew = false) => {
  if (forceNew) {
    return new REST(serviceOptions);
  }
  if (!globalRESTInstance || !(globalRESTInstance instanceof REST)) {
    globalRESTInstance = new REST(serviceOptions);
  }
  return globalRESTInstance;
};

module.exports = {
  Utils,
  Schema,
  Params,
  API,
  REST,
  getRESTInstance,
};
