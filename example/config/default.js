module.exports = {
  logger: {
    prefix: '',
    errorPrefix: 'error-',
    suffix: 'config-service',
    level: 'debug',
    colorize: true,
  },
  db: {
    // Настройки подключений к БД Postgres
    postgres: {
      // Настройки подключений к конкретным БД
      dbs: {},
    },
  },
};
