/* eslint-disable no-unused-expressions */

const {
    Schema,
    cpc,
    prepareTestEnv,
    clearTestEnv,
    clrRequire,
    newInstance
} = require('../../test-utils.es6')({ __dirname });

const schemaDir = Schema.getSchemaDir();

describe('Schema: _reloadSchema()', () => {
    let instance;
    before(() => {
        prepareTestEnv(false);
        clrRequire(`${schemaDir}/schema.js`);
        cpc('./schema1.es6', `${schemaDir}/schema.js`);
        instance = newInstance('Schema');
    });

    it('When reloading a modified Schema, changes should be visible', () => {
        expect(instance.schema.value[0].value[0].type).to.eql('string');
        cpc('./schema2.es6', `${schemaDir}/schema.js`);
        instance._reloadSchema();
        expect(instance.schema.value[0].value[0].type).to.eql('array');
    });

    after(clearTestEnv);
});
