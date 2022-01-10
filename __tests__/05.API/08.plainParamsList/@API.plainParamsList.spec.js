const lib = require('../../../src/lib.js');

const { prepareTestEnv, clearTestEnv } = require('../../test-utils.js')({ __dirname });

const expectedListFull = lib.cloneDeep(require('./list-full.json'));
const expectedList = lib.cloneDeep(require('./list.json'));
const expectedListEx = lib.cloneDeep(require('./list_extended.json'));

describe('API: plainParamsList()', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('API');
  });

  test(`plainParamsList full`, () => {
    const testValue = instance.plainParamsList();
        expect(testValue).toMatchObject(expectedListFull);
  });

  test(`plainParamsList ('config1')`, () => {
    const testValue = instance.plainParamsList('config1');
        expect(testValue).toMatchObject(expectedList);
  });

  test(`plainParamsList`, () => {
    const testValue = instance.plainParamsList('config1', { isExtended: true });
        expect(testValue).toMatchObject(expectedListEx);
  });

  after(clearTestEnv);
});
