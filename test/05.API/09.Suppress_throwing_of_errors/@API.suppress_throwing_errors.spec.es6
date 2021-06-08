/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */

const {
    prepareTestEnv,
    clearTestEnv,
} = require('../../test-utils.es6')({ __dirname });

describe('API: Suppress throwing of ERRORS', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('API', undefined, undefined, { noThrow: true });
    });

    it('Do not throw an ERROR if the parameter is absent in the schema...', () => {
        instance = prepareTestEnv('API');
        const paramValue = instance.get('config1.div11.divfoo');
        expect(paramValue).equals(undefined);
    });

    after(clearTestEnv);
});
