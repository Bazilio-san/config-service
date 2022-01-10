const {
  prepareTestEnv,
  clearTestEnv
} = require('../../test-utils.js')({ __dirname });

const expected = require('./expected.js');

describe('Schema: Method traverseSchema should work properly', () => {
  let instance;

  beforeAll(() => {
    instance = prepareTestEnv('Schema');
  });

  test('Method traverseSchema should properly calls itemCallback()', () => {
    const traverseOptions = { accum: [] };
        instance.traverseSchema(instance.schema, traverseOptions, (schemaItem, options) => {
            options.accum.push(schemaItem.id);
        });
        expect(traverseOptions.accum).toMatchObject(expected.traverseItem);
  });

  test('Method traverseSchema should properly calls valueCallback()', () => {
    const traverseOptions = { accum: [] };
        instance.traverseSchema(instance.schema, traverseOptions, null, (schemaItem, options) => {
            options.accum.push(schemaItem.length);
        });
        expect(traverseOptions.accum).toMatchObject(expected.traverseValue);
  });

  test('Method traverseSchema should properly calls propertyCallback()', () => {
    const traverseOptions = { accum: [] };
        instance.traverseSchema(instance.schema, traverseOptions, null, null, (schemaItem, options) => {
            options.accum.push(`${schemaItem.id} / ${schemaItem.type}`);
        });
        expect(traverseOptions.accum).toMatchObject(expected.traverseProperty);
  });

  after(clearTestEnv);
});
