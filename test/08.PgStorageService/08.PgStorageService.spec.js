const sinon = require('sinon');
const PgStorage = require('../../src/storage-service/pg-storage/PgStorage');
const ee = require('../../src/ee');

const debugIt = sinon.stub();
const prepareSqlValuePg = sinon.stub();
const setConfigRowsToConfig = sinon.stub();

describe('PgStorage', () => {
  let sandbox;
  let pgStorage;
  let clock;
  let queryPgSpy;
  let mockRes;
  let emitSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sinon.useFakeTimers();
    emitSpy = sandbox.stub(ee, 'emit');
    sandbox.stub(global, 'clearInterval');
    sandbox.stub(global, 'setInterval').callsFake((fn, interval) => setTimeout(fn, interval));
    debugIt.reset();
    prepareSqlValuePg.reset();
    setConfigRowsToConfig.reset();
    pgStorage = new PgStorage({ dbId: 'test-db' });
    mockRes = {
      rows: [
        { configName: 'testConfig', paramPath: 'testConfig.path1', value: 'value1' },
        { configName: 'testConfig', paramPath: 'testConfig.path2', value: 'value2' },
      ],
    };
    queryPgSpy = sandbox.stub(pgStorage, '_queryPg');
    queryPgSpy.callsFake(() => mockRes);
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  describe('constructor', () => {
    it('should initialize properties correctly', () => {
      expect(pgStorage.dbId).to.equal('test-db');
      expect(pgStorage.updates).to.deep.equal({ schedule: {} });
      expect(pgStorage.lastFetchedRows).to.be.instanceOf(Map);
    });

    it('should set up an interval for fetching updates', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(global.clearInterval.calledOnce).to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(global.setInterval.calledOnce).to.be.true;
    });
  });

  describe('getNamedConfig', () => {
    it('should retrieve and process config rows', async () => {
      const result = await pgStorage.getNamedConfig('testConfig');

      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.calledOnce).to.be.true;
      expect(result).to.deep.equal({ path1: 'value1', path2: 'value2' });
      expect(pgStorage.lastFetchedRows.size).to.equal(2);
    });

    it('should return undefined if no rows are found', async () => {
      const result = await pgStorage.getNamedConfig('testConfigFake');

      // eslint-disable-next-line no-unused-expressions
      expect(result).to.be.undefined;
    });
  });

  describe('_fetchConfigChanges', () => {
    it('should fetch changes and emit event if rows are found', async () => {
      mockRes = {
        rows: [
          { configName: 'testConfig', paramPath: 'testConfig.path3', value: 'newValue1' },
        ],
      };

      await pgStorage._fetchConfigChanges();

      // eslint-disable-next-line no-unused-expressions
      expect(emitSpy.called).to.be.true;
      expect(pgStorage.lastFetchedRows.get('testConfig.path3')).to.deep.equal('newValue1');
    });

    it('should not emit event if no new rows are found', async () => {
      mockRes = undefined;

      await pgStorage._fetchConfigChanges();

      // eslint-disable-next-line no-unused-expressions
      expect(emitSpy.notCalled).to.be.true;
      expect(pgStorage.lastFetchedRows.size).to.equal(0);
    });
  });

  describe('scheduleUpdate', () => {
    it('should add payload to the update schedule', () => {
      const payload = { configName: 'testConfig', paramPath: 'path1', value: 'value1' };

      pgStorage.scheduleUpdate(payload);

      expect(pgStorage.updates.schedule.path1).to.equal(payload);
    });
  });

  describe('_flashUpdateSchedule', () => {
    it('should send updates to the database', async () => {
      pgStorage.lastFetchedRows.set('path1', 'oldValue');
      const payload = { configName: 'testConfig', paramPath: 'path1', value: 'newValue' };
      pgStorage.scheduleUpdate(payload);
      prepareSqlValuePg.returns(`'newValue'`);

      await pgStorage._flashUpdateSchedule();

      // eslint-disable-next-line no-unused-expressions
      expect(pgStorage._queryPg.calledOnce).to.be.true;
      expect(pgStorage.updates.schedule).to.deep.equal({});
    });

    it('should not send updates if values have not changed', async () => {
      pgStorage.lastFetchedRows.set('path1', 'sameValue');
      const payload = { configName: 'testConfig', paramPath: 'testConfig.path1', value: 'sameNewValue' };
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
        const payload = { configName: 'testConfig', paramPath, value: `value${i}` };
        pgStorage.updates.schedule[paramPath] = payload;
        prepareSqlValuePg.withArgs(sinon.match({ value: `value${i}` })).returns(`'value${i}'`);
      }

      await pgStorage._flashUpdateSchedule();

      expect(pgStorage._queryPg.callCount).to.equal(1); // Because MAX_FLASH_UPDATE_INSERT_INSTRUCTIONS is 10
    });
  });

  describe('Integration Test', () => {
    it('should handle the update cycle correctly', async () => {
      pgStorage.lastFetchedRows.set('path1', 'oldValue1');
      pgStorage.scheduleUpdate({ configName: 'testConfig', paramPath: 'path1', value: 'newValue1' });
      pgStorage.scheduleUpdate({ configName: 'testConfig', paramPath: 'path2', value: 'newValue2' });

      await pgStorage._flashUpdateSchedule();
      await pgStorage._fetchConfigChanges();

      expect(pgStorage._queryPg.callCount).to.equal(2);
      // eslint-disable-next-line no-unused-expressions
      expect(emitSpy.called).to.be.true;
    });
  });
});
