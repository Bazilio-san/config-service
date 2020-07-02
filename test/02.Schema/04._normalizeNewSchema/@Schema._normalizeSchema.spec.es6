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

describe('Schema: _normalizeNewSchema()', () => {
    let instance;
    before(() => {
        prepareTestEnv(false);
        clrRequire(`${schemaDir}/schema.js`);
        cpc('./schema-no-default-properties.es6', `${schemaDir}/schema.js`);
        instance = newInstance('Schema');
    });

    it('Missing optional properties should be added', () => {
        expect(instance.schema.value[0]).to.eql({
            id: 'rule1',
            title: 'Title of rule1',
            t: 'cs:rule1.title',
            type: 'section',
            value: []
        });
    });

    it('Check full normalized schema', () => {
        clrRequire(`${schemaDir}/schema.js`);
        const originalSchema = require('../../resources/schema.es6');
        const expected = require('./schema-normalized---default-values.es6');
        const normalizeFullSchema = instance._normalizeNewSchema(originalSchema);
        expect(normalizeFullSchema).to.eql(expected);
    });

    after(clearTestEnv);
});
