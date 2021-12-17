const path = require('path');
const {
  prepareTestEnv,
  clearTestEnv,
  cpc,
  clrRequire,
  Params,
  newInstance,
  fnError,
  niError
} = require('../../test-utils.js')({ __dirname });

const __ = require('../../../src/lib.js');

describe('Params: _readNamedConfig(), _saveNamedConfig(), _reloadConfig()', () => {
  describe('_readNamedConfig, _saveNamedConfig, _reloadConfig', () => {
    let instance;
    before(() => {
      instance = prepareTestEnv('Params');
    });

    // _reloadConfig is indirectly tested

    const expectedConfig = require('../00.new/expected-new-config.js');

        __.each(expectedConfig, (expectedValue, configName) => {
          it(`Check object "${configName}"`, () => {
            const config = instance._getValues();
                expect(config[configName]).to.eql(expectedValue);
          });
          it(`Check file "${configName}.json"`, () => {
            const config = instance._readNamedConfig(configName);
                expect(config).to.eql(expectedValue);
          });
        });

        it('When reloading a modified config, changes should be visible', () => {
          const configName = 'config_02';
          const configFile = `${Params.getConfigDir()}/${configName}.json`;
          clrRequire(configFile);
          cpc('./schema_small.js', `${Params.getSchemaDir()}/schema.js`);
          cpc('./config_02.json', configFile);

          instance = newInstance('Params');

          // The first version of the named configuration is read

          cpc('./config_02_2.json', configFile);
            instance._readNamedConfig(configName);

            // The second version of the named configuration is read

            const configValue = instance._readNamedConfig(configName);
            instance._updateAndSaveNamedConfig(configName, configValue);
            const config = instance._getValues();
            expect(config.config_02.param_02).to.eql('version 2');
        });

        it('ERROR: Could not load named configuration file (1)', () => {
          const configDir = Params.getConfigDir();
          clrRequire(`${configDir}/config_02.json`);
          cpc('./config-file-bad.json.txt', `${configDir}/config_02.json`);
            expect(fnError(instance, '_readNamedConfig', 'config_02'))
                .to.have.string('Could not load named configuration file');
        });

        // eslint-disable-next-line max-len
        it('ERROR: Could not load named configuration file (When creating a new service instance, named configurations should not be cached)', () => {
          cpc('./config-file-bad.json.txt', `${Params.getConfigDir()}/config_02.json`);
            expect(niError('Params')).to.have.string('Could not load named configuration file');
        });

        after(clearTestEnv);
  });
  describe('Overriding service directories should work properly', () => {
    let instance;
    before(() => {
      const absConfigDir = path.resolve(path.join(process.cwd(), 'example/_cfg_'));
      instance = prepareTestEnv('Params', './example/_schema_', absConfigDir);
    });
    it('Checking for presence of a Schema in an overridden directory', () => {
      const schemaFile = path.resolve(path.join(process.cwd(), 'example/_schema_/schema.js'));
      clrRequire(schemaFile);
      // eslint-disable-next-line import/no-dynamic-require
      const expected = require(schemaFile);
            expect(expected[0].id).equal('config1');
    });
    it('Checking for named configuration in an overridden directory', () => {
      const config = instance._getValues();
            config.config1.div10 = '!!!НОВАЯ СТРОКА!!!';
            instance._updateAndSaveNamedConfig('config1', config.config1);
            const config1File = path.resolve(path.join(process.cwd(), 'example/_cfg_/config1.json'));
            clrRequire(config1File);
            // eslint-disable-next-line import/no-dynamic-require
            const expected = require(config1File);
            expect(expected.div10).equal('!!!НОВАЯ СТРОКА!!!');
    });
    after(clearTestEnv);
  });
});
