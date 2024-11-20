let globalLogger;

const echo = (msg) => {
  if (globalLogger) {
    globalLogger.info(msg);
  }
  console.log(msg);
};

const initLogger = (logger) => {
  globalLogger = logger;
};

module.export = { echo, initLogger };
