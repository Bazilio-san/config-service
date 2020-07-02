const REST = require('./REST.es6');

let globalInstance;

module.exports = (serviceOptions) => {
    if (globalInstance && globalInstance instanceof REST) {
        return globalInstance;
    }
    return new REST(serviceOptions);
};
