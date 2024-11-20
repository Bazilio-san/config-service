const setIntervalAsync = require('set-interval-async/dynamic');
const { getPoolPg, TABLE_NAME } = require('./pg-service.js');

const updates = { schedule: {} };

const scheduleUpdate = (payload) => {
  updates.schedule[payload.paramPath] = payload;
};

const flashUpdateSchedule = async () => {
  const preRequests = Object.values(updates.schedule);
  updates.schedule = {};
  if (!preRequests.length) {
    return true;
  }
  const values = [];
  const sql = preRequests.map(({ configName, paramPath, value }, index) => {
    values.push(value);
    // @formatter:off
    return `INSERT INTO ${TABLE_NAME} ("configName", "paramPath", "value", "updatedAt")
      VALUES ('${configName}', '${paramPath}', $${index + 1}, CURRENT_TIMESTAMP)
      ON CONFLICT ("paramPath")
      DO UPDATE SET
          "value" = $${index + 1},
          "updatedAt" = CURRENT_TIMESTAMP;`;
    // @formatter:on
  }).join('\n');
  try {
    const pool = await getPoolPg();
    const res = await pool.query(sql, values);
    return res;
  } catch (error) {
    console.error(error);
  }
};

// setIntervalAsync(async () => {
//   await flashUpdateSchedule();
// }, 1000);

module.exports = scheduleUpdate;
