const { API, prepareTestEnv, clearTestEnv, toPlainObj } = require('../../test-utils.js')({ __dirname });

const csNoi18n = require('./cs.no.i18n.json');

describe('API: initialized with default parameters should work properly', () => {
  let instance;
  before(async () => {
    await prepareTestEnv('API');
    instance = new API();
    await instance.init();
  });

  it('Check Schema', () => {
    const result = instance.getSchema('config1.div11.div21.div31');
    expect(toPlainObj(result)).to.eql({
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

  it('Check Schema with language', () => {
    const result = instance.getSchema('config1.div11.div21.div31', 'ru');
    expect(toPlainObj(result)).to.eql({
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

  it('Check config', () => {
    const config = instance._getValues();
    expect(instance.get('config1.div11.div21')).to.eql(config.config1.div11.div21);
  });

  it('Check config after change', () => {
    instance.set('config1.div11.div21.div31.div41', 'new value...');
    expect(instance.get('config1.div11.div21.div31.div41')).to.eql('new value...');
  });

  it('Check _getTranslationTemplate()', () => {
    const result = instance.getTranslationTemplate({
      lng: 'ru',
      onlyStandardPaths: true,
      addPaths: false
    });
    expect(result).to.eql(csNoi18n);
  });

  after(clearTestEnv);
});
