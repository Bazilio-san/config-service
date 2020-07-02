/* eslint-disable max-len */
const {
    prepareTestEnv,
    clearTestEnv
} = require('../../test-utils.es6')({ __dirname });

const expectedSchema = require('../../resources/with-actual-values/schema---av.es6');
const expected = require('./expected-config.es6');

describe('Params: _getValuesFromSchemaFragment()', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('Params');
    });

    it('from fullSchema', () => {
        const result = instance._getValuesFromSchemaFragment(expectedSchema);
        expect(result).to.eql(expected);
    });

    it('from fragment: fullSchema.value', () => {
        const result = instance._getValuesFromSchemaFragment(expectedSchema.value);
        expect(result).to.eql(expected.__root__);
    });

    it('from fragment: config1', () => {
        const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0]);
        expect(result.config1).to.eql(expected.__root__.config1);
    });

    it('from fragment: config1.div11', () => {
        const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0].value[1]);
        expect(result.div11).to.eql(expected.__root__.config1.div11);
    });

    it('from fragment: config1.div11.div21.div31', () => {
        const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0].value[1].value[0].value[0]);
        expect(result.div31).to.eql(expected.__root__.config1.div11.div21.div31);
    });

    it('from fragment: config1.div11.div21.div31.div41', () => {
        const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0].value[1].value[0].value[0].value[0]);
        expect(result.div41).to.eql(expected.__root__.config1.div11.div21.div31.div41);
    });

    after(clearTestEnv);
});
