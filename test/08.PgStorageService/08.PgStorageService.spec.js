const sinon = require('sinon');
const configModule = require('config');
const PgStorage = require('../../src/storage-service/pg-storage/PgStorage');
const ee = require('../../src/ee');
const { FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS } = require('../../src/storage-service/pg-storage/pg-service-config');

const testSchema = 'test';
const testTableName = 'test-table';
const testTableHistoryName = 'test-history-table';

describe('PgStorage', () => {
  let sandbox;
  let pgStorage;
  let emitSpy;
  const config = configModule.util.toObject();
  const dbId = Object.keys(config.db.postgres.dbs)[0];

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    emitSpy = sandbox.stub(ee, 'emit');
    sandbox.stub(global, 'clearInterval');
    sandbox.stub(global, 'setInterval').callsFake((fn, interval) => setTimeout(fn, interval));
    pgStorage = new PgStorage({
      dbId,
      schema: testSchema,
      settingsTableName: testTableName,
      settingsHistoryTableName: testTableHistoryName,
    });
    await pgStorage._queryPg(`DELETE FROM "${testSchema}"."${testTableName}";`);
    await pgStorage._queryPg(`DELETE FROM "${testSchema}"."${testTableHistoryName}";`);

    const payload = { configName: 'testConfig', paramPath: 'testConfig.path1', value: 'value1', updatedBy: 'testUser' };
    const payload2 = { configName: 'testConfig', paramPath: 'testConfig.path2', value: 'value2', updatedBy: 'testUser' };
    pgStorage.scheduleUpdate(payload);
    pgStorage.scheduleUpdate(payload2);
    await pgStorage._flashUpdateSchedule();
    sandbox.spy(pgStorage, '_queryPg');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should initialize properties correctly', () => {
      expect(pgStorage.dbId).to.equal(dbId);
      expect(pgStorage.updates).to.deep.equal({ schedule: {} });
      expect(pgStorage.lastFetchedRows).to.be.instanceOf(Map);
    });

    it('should set up an interval for fetching updates', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(global.clearInterval.calledOnce).to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(global.setInterval.calledOnce).to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(global.setInterval.calledWith(sinon.match.func, FLASH_UPDATE_SCHEDULE_INTERVAL_MILLIS)).to.be.true;
    });
  });

  describe('getNamedConfig', () => {
    it('should retrieve and process config rows', async () => {
      const result = await pgStorage.getNamedConfig('testConfig');

      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.calledOnce).to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.calledWith(`---
      SELECT *
      FROM "${testSchema}"."${testTableName}"
      WHERE "configName" = 'testConfig'
      `)).to.be.true;
      expect(result.path1).to.deep.equal('value1');
      expect(result.path2).to.deep.equal('value2');
    });

    it('should return undefined if no rows are found', async () => {
      const result = await pgStorage.getNamedConfig('testConfigFake');

      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.calledWith(`---
      SELECT *
      FROM "${testSchema}"."${testTableName}"
      WHERE "configName" = 'testConfigFake'
      `)).to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(result).to.be.undefined;
    });
  });

  describe('_fetchConfigChanges', () => {
    it('should fetch changes and emit event if rows are found', async () => {
      await pgStorage._queryPg(`DELETE FROM "${testSchema}"."${testTableName}";`);
      await pgStorage._queryPg(`DELETE FROM "${testSchema}"."${testTableHistoryName}";`);
      const payload3 = { configName: 'testConfig', paramPath: 'testConfig.path3', value: 'value3', updatedBy: 'testUser' };
      pgStorage.scheduleUpdate(payload3);
      await pgStorage._flashUpdateSchedule();

      await pgStorage._fetchConfigChanges();

      // eslint-disable-next-line no-unused-expressions
      expect(emitSpy.called).to.be.true;
      expect(pgStorage.lastFetchedRows.get('testConfig.path3')).to.deep.equal('value3');
    });

    it('should not emit event if no new rows are found', async () => {
      await pgStorage._queryPg(`DELETE FROM "${testSchema}"."${testTableName}";`);
      await pgStorage._queryPg(`DELETE FROM "${testSchema}"."${testTableHistoryName}";`);
      await pgStorage._fetchConfigChanges();

      // eslint-disable-next-line no-unused-expressions
      expect(emitSpy.notCalled).to.be.true;
      expect(pgStorage.lastFetchedRows.size).to.equal(0);
    });
  });

  describe('scheduleUpdate', () => {
    it('should add payload to the update schedule', () => {
      const payload = { configName: 'testConfig', paramPath: 'testConfig.path1', value: 'value1', updatedBy: 'testUser' };
      const payload2 = { configName: 'testConfig', paramPath: 'testConfig.path2', value: 'value1', updatedBy: 'testUser' };

      pgStorage.scheduleUpdate(payload);
      pgStorage.scheduleUpdate(payload2);

      expect(pgStorage.updates.schedule['testConfig.path1']).to.equal(payload);
      expect(pgStorage.updates.schedule['testConfig.path2']).to.equal(payload2);
    });
  });

  describe('_flashUpdateSchedule', () => {
    it('should send updates to the database', async () => {
      pgStorage.lastFetchedRows.set('testConfig.path1', 'oldValue');
      const payload = { configName: 'testConfig', paramPath: 'testConfig.path1', value: 'newValue', updatedBy: 'testUser' };
      pgStorage.scheduleUpdate(payload);

      await pgStorage._flashUpdateSchedule();

      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.callCount).to.equal(2); // should update config_service, config_service_history
      expect(pgStorage.updates.schedule).to.deep.equal({});
    });

    it('should not send updates if values have not changed', async () => {
      pgStorage.lastFetchedRows.set('path1', 'sameValue');
      const payload = { configName: 'testConfig', paramPath: 'testConfig.path1', value: 'sameNewValue', updatedBy: 'testUser' };
      pgStorage.updates.schedule.path1 = payload;
      pgStorage.lastFetchedRows.set('testConfig.path1', 'sameNewValue');

      await pgStorage._flashUpdateSchedule();

      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.notCalled).to.be.true;
      expect(pgStorage.updates.schedule).to.deep.equal({});
    });

    it('should handle batch updates', async () => {
      for (let i = 0; i < 15; i++) {
        const paramPath = `testConfig.path${i}`;
        const payload = { configName: 'testConfig', paramPath, value: `value${i}`, updatedBy: 'testUser' };
        pgStorage.updates.schedule[paramPath] = payload;
      }

      await pgStorage._flashUpdateSchedule();

      expect(pgStorage._queryPg.callCount).to.equal(2); // should update config_service, config_service_history
    });
  });

  describe('Integration Test', () => {
    it('should handle the update cycle correctly', async () => {
      pgStorage.lastFetchedRows.set('path1', 'oldValue1');
      pgStorage.scheduleUpdate({ configName: 'testConfig', paramPath: 'testConfig.path1', value: 'newValue1', updatedBy: 'testUser' });
      pgStorage.scheduleUpdate({ configName: 'testConfig', paramPath: 'testConfig.path2', value: 'newValue2', updatedBy: 'testUser' });

      await pgStorage._flashUpdateSchedule();
      await pgStorage._fetchConfigChanges();

      expect(pgStorage._queryPg.callCount).to.equal(3); // should update config_service, config_service_history and fetch changes
      // eslint-disable-next-line no-unused-expressions
      expect(emitSpy.called).to.be.true;
    });

    it('should not update config_service but fetch changes', async () => {
      await pgStorage.getNamedConfig('testConfig1');
      await pgStorage._flashUpdateSchedule();

      expect(pgStorage._queryPg.callCount).to.equal(1); // should not update config_service but fetch changes
    });

    it('should update config_service but not fetch changes', async () => {
      pgStorage.scheduleUpdate({ configName: 'testConfig', paramPath: 'testConfig.path1', value: 'newValue1', updatedBy: 'testUser' });

      await pgStorage._flashUpdateSchedule();

      expect(pgStorage._queryPg.callCount).to.equal(2); // should update config_service and config_service_history
    });
  });
});
