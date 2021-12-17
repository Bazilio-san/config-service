const lib = require('../../../src/lib.js');

const { prepareTestEnv, clearTestEnv } = require('../../test-utils.es6')({ __dirname });

const expectedListFull = lib.cloneDeep(require('./list-full.json'));
const expectedList = lib.cloneDeep(require('./list.json'));
const expectedListEx = lib.cloneDeep(require('./list_extended.json'));

describe('API: plainParamsList()', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('API');
    });

    it(`plainParamsList full`, () => {
        const testValue = instance.plainParamsList();
        expect(testValue).to.eql(expectedListFull);
    });

    it(`plainParamsList ('config1')`, () => {
        const testValue = instance.plainParamsList('config1');
        expect(testValue).to.eql(expectedList);
    });

    it(`plainParamsList`, () => {
        const testValue = instance.plainParamsList('config1', { isExtended: true });
        expect(testValue).to.eql(expectedListEx);
    });

    after(clearTestEnv);
});
