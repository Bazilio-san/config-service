const {
  clearTestEnv,
  prepareTestEnv,
  Schema,
  serviceOptions
} = require('../../test-utils.js')({ __dirname });

describe('Schema: _isLang()', () => {
  let instance;
  before(() => {
    prepareTestEnv(false);
  });
  [
    [{}, 'ru', false],
    [{}, 'foo', false],
    [serviceOptions, 'ru', true],
    [serviceOptions, 'foo', false]
  ].forEach(([options, lng, expected]) => {
    it(`Schema: _isLang: ${options.i18n ? 'i18n / ' : ''} ${lng} -> ${expected}`, () => {
      instance = new Schema(options);
      expect(instance._isLang(lng)).equals(expected);
    });
  });
  after(clearTestEnv);
});
