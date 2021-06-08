const {
    prepareTestEnv,
    clearTestEnv
} = require('../../test-utils.es6')({ __dirname });

const expected = require('./expected.es6');

describe('Schema: Method traverseSchema should work properly', () => {
    let instance;

    before(() => {
        instance = prepareTestEnv('Schema');
    });

    it('Method traverseSchema should properly calls itemCallback()', () => {
        const traverseOptions = { accum: [] };
        instance.traverseSchema(instance.schema, traverseOptions, (schemaItem, options) => {
            options.accum.push(schemaItem.id);
        });
        expect(traverseOptions.accum).to.eql(expected.traverseItem);
    });

    it('Method traverseSchema should properly calls valueCallback()', () => {
        const traverseOptions = { accum: [] };
        instance.traverseSchema(instance.schema, traverseOptions, null, (schemaItem, options) => {
            options.accum.push(schemaItem.length);
        });
        expect(traverseOptions.accum).to.eql(expected.traverseValue);
    });

    it('Method traverseSchema should properly calls propertyCallback()', () => {
        const traverseOptions = { accum: [] };
        instance.traverseSchema(instance.schema, traverseOptions, null, null, (schemaItem, options) => {
            options.accum.push(`${schemaItem.id} / ${schemaItem.type}`);
        });
        expect(traverseOptions.accum).to.eql(expected.traverseProperty);
    });

    after(clearTestEnv);
});
