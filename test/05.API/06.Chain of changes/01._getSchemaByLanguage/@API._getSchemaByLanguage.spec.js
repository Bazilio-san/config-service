/* eslint-disable no-unused-expressions */

const { prepareTestEnv, clearTestEnv } = require('../../../test-utils.js')({ __dirname });

function getValueByPathFromSchema (schema, pathArr) {
  let val = schema.value;
  pathArr.forEach((lastid) => {
    const index = val.findIndex(({ id }) => id === lastid);
    val = val[index].value;
  });
  return val;
}

describe('API: _getSchemaByLanguage(): Parameter updates should apply to all objects and cached data', () => {
  let instance;
  const expected = '"New value by set()"';
  const pathArr = ['config1', 'div11', 'div21', 'div31', 'div41'];
  const paramPath = pathArr.join('.');
  before(async () => {
    instance = await prepareTestEnv('API');

    instance._parseParamPath(paramPath, { callFrom: 'test' });
    instance._parseParamPath('config1', { callFrom: 'test' });
    instance._parseParamPath('', { callFrom: 'test' });

    instance.set(paramPath, expected);
  });

  it('First retrieve localized schema after change', () => {
    const realValue = getValueByPathFromSchema(instance._getSchemaByLanguage('ru'), pathArr);
    expect(realValue).equals(expected);
  });
  [1, 2, 3].forEach((attempt) => {
    it(`Making a change and getting a localized schema after the change # ${attempt}`, () => {
      const expected_ = `${expected}-${attempt}`;
      instance.set(paramPath, expected_);
      const realValue = getValueByPathFromSchema(instance._getSchemaByLanguage('ru'), pathArr);
      expect(realValue).equals(expected_);
    });
  });

  after(clearTestEnv);
});
