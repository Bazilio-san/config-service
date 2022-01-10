const { prepareTestEnv, clearTestEnv } = require('../../test-utils.js')({ __dirname });

const ruSt = require('./cs.ru.std.json');
const ruStdPath = require('./cs.ru.std.paths.json');
const ruExPath = require('./cs.ru.ex.paths.json');

describe('API: Function getTranslationTemplate() should work properly', () => {
  let instance;
  beforeAll(() => {
    instance = prepareTestEnv('API');
  });

  test('ru / std paths', () => {
    const result = instance.getTranslationTemplate({ lng: 'ru', onlyStandardPaths: true, addPaths: false });
        expect(result).toMatchObject(ruSt);
  });

  test('ru / std paths / +t-paths', () => {
    const result = instance.getTranslationTemplate({ lng: 'ru', onlyStandardPaths: true, addPaths: true });
        expect(result).toMatchObject(ruStdPath);
  });

  test('ru / existed paths / +t-paths ', () => {
    const result = instance.getTranslationTemplate({ lng: 'ru', onlyStandardPaths: false, addPaths: true });
        expect(result).toMatchObject(ruExPath);
  });

  after(clearTestEnv);
});
