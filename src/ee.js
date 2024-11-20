const EventEmitter = require('events');

const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(12);
module.exports = eventEmitter;
