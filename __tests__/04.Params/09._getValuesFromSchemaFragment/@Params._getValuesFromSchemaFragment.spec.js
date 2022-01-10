/* eslint-disable max-len */
const {
  prepareTestEnv,
  clearTestEnv
} = require('../../test-utils.js')({ __dirname });

const expectedSchema = require('../../resources/with-actual-values/schema---av.js');
const expected = require('./expected-config.js');

describe('Params: _getValuesFromSchemaFragment()', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('Params');
  });

  test('from fullSchema', () => {
    const result = instance._getValuesFromSchemaFragment(expectedSchema);
        expect(result).toMatchObject(expected);
  });

  test('from fragment: fullSchema.value', () => {
    const result = instance._getValuesFromSchemaFragment(expectedSchema.value);
        expect(result).toMatchObject(expected.__root__);
  });

  test('from fragment: config1', () => {
    const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0]);
        expect(result.config1).toMatchObject(expected.__root__.config1);
  });

  test('from fragment: config1.div11', () => {
    const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0].value[1]);
        expect(result.div11).toMatchObject(expected.__root__.config1.div11);
  });

  test('from fragment: config1.div11.div21.div31', () => {
    const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0].value[1].value[0].value[0]);
        expect(result.div31).toMatchObject(expected.__root__.config1.div11.div21.div31);
  });

  test('from fragment: config1.div11.div21.div31.div41', () => {
    const result = instance._getValuesFromSchemaFragment(expectedSchema.value[0].value[1].value[0].value[0].value[0]);
        expect(result.div41).toMatchObject(expected.__root__.config1.div11.div21.div31.div41);
  });

  after(clearTestEnv);
});
