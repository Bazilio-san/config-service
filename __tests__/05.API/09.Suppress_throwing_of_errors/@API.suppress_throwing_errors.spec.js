/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */

const {
  prepareTestEnv,
  clearTestEnv
} = require('../../test-utils.js')({ __dirname });

describe('API: Suppress throwing of ERRORS', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('API', undefined, undefined, { noThrow: true });
  });

  test('Do not throw an ERROR if the parameter is absent in the schema...', () => {
    instance = prepareTestEnv('API');
    const paramValue = instance.get('config1.div11.divfoo');
        expect(paramValue).equals(undefined);
  });

  after(clearTestEnv);
});
