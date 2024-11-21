const _5_MIN = 5 * 60_000; // 5 min
const _3_HOURS = 3_600_000 * 3; // 3 ч

const UPDATE_TIME = 10; // in seconds

const TABLE_NAME = 'core.config_service';

const defaultOptions = {
  // all valid client config options are also valid here
  // in addition here are the pool specific configuration parameters:
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: _5_MIN, // 5 min
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis: _3_HOURS, // 3 h
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max: 10,
  port: 5432,
  statement_timeout: _3_HOURS, // number of milliseconds before a statement in query will time out, default is no timeout
  query_timeout: _3_HOURS, // number of milliseconds until the request call times out, no timeout by default
};

module.exports = { defaultOptions, TABLE_NAME, UPDATE_TIME };
