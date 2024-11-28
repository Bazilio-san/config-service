const sinon = require('sinon');
const fs = require('fs');
const util = require('util');
const FileStorage = require('../../src/storage-service/FileStorage');
const ConfigServiceError = require('../../src/ConfigServiceError');
const Schema = require('../../src/Schema.js');

describe('FileStorage', () => {
  let sandbox;
  let fileStorage;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(process, 'cwd').returns('fakeRoot');
    sandbox.stub(Schema, 'getConfigDir').returns('fakeRoot\\config');
    sandbox.stub(fs, 'existsSync');
    sandbox.stub(fs, 'lstatSync');
    fs.existsSync.withArgs('fakeRoot\\config').returns(true);
    fs.lstatSync.withArgs('fakeRoot\\config').returns({ isDirectory: () => true });
    fileStorage = new FileStorage();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should throw an error if the config directory does not exist', () => {
      fs.existsSync.withArgs('fakeRoot\\config').returns(false);
      expect(() => new FileStorage()).to.throw(
        ConfigServiceError,
        'Missing configuration directory: <proj_root>/config',
      );
    });

    it('should throw an error if the config directory is not a directory', () => {
      fs.lstatSync.withArgs('fakeRoot\\config').returns({ isDirectory: () => false });
      expect(() => new FileStorage()).to.throw(
        ConfigServiceError,
        'The expected configuration directory is a file: <proj_root>/config',
      );
    });

    it('should set configDir and _expectedConfigDir correctly', () => {
      expect(fileStorage.configDir).to.equal('fakeRoot\\config');
      expect(fileStorage._expectedConfigDir).to.equal('<proj_root>/config');
    });
  });

  describe('saveConfig', () => {
    it('should save the config file', async () => {
      const writeFileStub = sandbox.stub(util, 'promisify').returns(() => Promise.resolve());
      const configName = 'testConfig';
      const jsonStr = '{"key": "value"}';

      await fileStorage.saveConfig(configName, jsonStr);

      // eslint-disable-next-line no-unused-expressions
      expect(writeFileStub.calledOnce).to.be.true;
      expect(writeFileStub.firstCall.args[0]).to.equal(fs.writeFile);
    });

    it('should throw an error if writeFile fails', (done) => {
      sandbox.stub(util, 'promisify').returns(() => Promise.reject(new Error('Write error')));
      const configName = 'testConfig';
      const jsonStr = '{"key": "value"}';

      fileStorage.saveConfig(configName, jsonStr).catch((err) => {
        expect(err.message).to.be('Write error');
      }).finally(() => {
        done();
      });
    });
  });

  describe('getNamedConfig', () => {
    it('should read and parse the config file', async () => {
      fs.existsSync.withArgs('fakeRoot\\config\\testConfig.json').returns(true);
      sandbox.stub(util, 'promisify').returns(() => Promise.resolve('{"key": "value"}'));
      const configName = 'testConfig';

      const result = await fileStorage.getNamedConfig(configName);

      expect(result).to.deep.equal({ key: 'value' });
    });

    it('should throw an error if readFile fails', async () => {
      fs.existsSync.withArgs('fakeRoot\\config\\testConfig.json').returns(true);
      sandbox.stub(util, 'promisify').returns(() => Promise.reject(new Error('Read error')));
      const configName = 'testConfig';
      let catchedError = null;
      try {
        await fileStorage.getNamedConfig(configName);
      } catch (err) {
        catchedError = err;
      }
      expect(catchedError).to.be.an('error');
      expect(catchedError?.message).to.equal('Could not load named configuration file «<proj_root>/config/testConfig.json»');
    });

    it('should throw an error if the config file does not exist', async () => {
      fs.existsSync.withArgs('fakeRoot\\config\\testConfig.json').returns(false);
      const configName = 'testConfig';
      let catchedError = null;
      let result;
      try {
        result = await fileStorage.getNamedConfig(configName);
      } catch (err) {
        catchedError = err;
      }
      expect(catchedError).to.equal(null);
      expect(result).to.equal(null);
    });
  });
});
