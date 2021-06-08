const { prepareTestEnv, clearTestEnv } = require('../../test-utils.es6')({ __dirname });

const ruSt = require('./cs.ru.std.json');
const ruStdPath = require('./cs.ru.std.paths.json');
const ruExPath = require('./cs.ru.ex.paths.json');

describe('API: Function getTranslationTemplate() should work properly', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('API');
    });

    it('ru / std paths', () => {
        const result = instance.getTranslationTemplate({ lng: 'ru', onlyStandardPaths: true, addPaths: false });
        expect(result).to.eql(ruSt);
    });

    it('ru / std paths / +t-paths', () => {
        const result = instance.getTranslationTemplate({ lng: 'ru', onlyStandardPaths: true, addPaths: true });
        expect(result).to.eql(ruStdPath);
    });

    it('ru / existed paths / +t-paths ', () => {
        const result = instance.getTranslationTemplate({ lng: 'ru', onlyStandardPaths: false, addPaths: true });
        expect(result).to.eql(ruExPath);
    });

    after(clearTestEnv);
});
