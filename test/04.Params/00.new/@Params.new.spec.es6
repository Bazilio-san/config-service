const {
    prepareTestEnv,
    clearTestEnv
} = require('../../test-utils.es6')({ __dirname });

const __ = require('../../../src/lib.es6');
const expectedNewDefaults = require('../../03.Defaults/expected-defaults.es6');
const expectedNewConfig = require('./expected-new-config.es6');
const expectedNewSchema = require('../../resources/with-actual-values/schema---av.es6');

describe('Params: check after constructor call', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('Params');
    });

    it(`new defaults`, () => {
        expect(instance.defaults).to.eql(expectedNewDefaults);
    });

    it(`new config by _getValues`, () => {
        const config = instance._getValues();
        expect(config).to.eql(expectedNewConfig);
    });

    __.each(expectedNewConfig, (expectedValue, configName) => {
        it(`Check file "${configName}.json"`, () => {
            const config = instance._readNamedConfig(configName);
            expect(config).to.eql(expectedValue);
        });
    });

    it(`new schema`, () => {
        expect(instance.schema).to.eql(expectedNewSchema);
    });

    after(clearTestEnv);
});
