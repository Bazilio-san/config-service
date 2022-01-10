const { API, prepareTestEnv, clearTestEnv } = require('../../test-utils.js')({ __dirname });

const csNoi18n = require('./cs.no.i18n.json');

describe('API: initialized with default parameters should work properly', () => {
  let instance;
  beforeAll(() => {
    prepareTestEnv('API');
    instance = new API();
  });

  test('Check Schema', () => {
    const result = instance.getSchema('config1.div11.div21.div31');
        expect(result).toMatchObject({
          id: 'div31',
          path: 'config1.div11.div21.div31',
          type: 'section',
          title: 'div31 title',
          t: 'cs:config1.div11.div21.div31.title',
          value: [
            {
              id: 'div41',
              path: 'config1.div11.div21.div31.div41',
              type: 'string',
              title: 'div41 title',
              t: 'cs:config1.div11.div21.div31.div41.title',
              value: 'ACTUAL string',
              defaultValue: 'default string'
            }
          ]
        });
  });

  test('Check Schema with language', () => {
    const result = instance.getSchema('config1.div11.div21.div31', 'ru');
        expect(result).toMatchObject({
          id: 'div31',
          path: 'config1.div11.div21.div31',
          type: 'section',
          title: 'div31 title',
          t: 'cs:config1.div11.div21.div31.title',
          value: [
            {
              id: 'div41',
              path: 'config1.div11.div21.div31.div41',
              type: 'string',
              title: 'div41 title',
              t: 'cs:config1.div11.div21.div31.div41.title',
              value: 'ACTUAL string',
              defaultValue: 'default string'
            }
          ]
        });
  });

  test('Check config', () => {
    const config = instance._getValues();
        expect(instance.get('config1.div11.div21')).toMatchObject(config.config1.div11.div21);
  });

  test('Check config after change', () => {
        instance.set('config1.div11.div21.div31.div41', 'new value...');
        expect(instance.get('config1.div11.div21.div31.div41')).toMatchObject('new value...');
  });

  test('Check _getTranslationTemplate()', () => {
    const result = instance.getTranslationTemplate({
      lng: 'ru',
      onlyStandardPaths: true,
      addPaths: false
    });
        expect(result).toMatchObject(csNoi18n);
  });

  after(clearTestEnv);
});
