/* eslint-disable max-len */
const lib = require('../../../src/lib.es6');
const {
    fnError,
    clearTestEnv,
    prepareTestEnv,
} = require('../../test-utils.es6')({ __dirname });

const schemaNormalized = lib.cloneDeep(require('../04._normalizeNewSchema/schema-normalized---default-values.es6'));

const config1 = schemaNormalized.value[0];
const div11 = config1.value[1];

describe('Schema: _getSchemaFragment()', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('Schema');
    });

    it('ERROR: Schema is either not an object or an empty object', () => {
        expect(fnError(instance, '_getSchemaFragment', [], [0, 1], 'test'))
            .to.match(/is empty or either not an object or an empty object/);
    });

    it('Get full Schema', () => {
        const actualFullSchema = instance._getSchemaFragment([], instance.schema, 'test');
        expect(actualFullSchema).to.eql(schemaNormalized);
    });

    it(`Get Schema fragment 'config1.div11'`, () => {
        const schemaBranch = instance._getSchemaFragment(['config1', 'div11'], instance.schema, 'test');
        expect(schemaBranch).to.eql(div11);
    });

    it(`Get Schema fragment 'config1.div11.div21.div31'`, () => {
        const schemaBranch = instance._getSchemaFragment(['config1', 'div11', 'div21', 'div31'], instance.schema, 'test');
        expect(schemaBranch).to.eql(div11.value[0].value[0]);
    });

    it(`Get Schema fragment 'config1.div11.div21.div31.div41'`, () => {
        const schemaBranch = instance._getSchemaFragment(['config1', 'div11', 'div21', 'div31', 'div41'], instance.schema, 'test');
        expect(schemaBranch).to.eql(div11.value[0].value[0].value[0]);
    });

    after(clearTestEnv);
});
