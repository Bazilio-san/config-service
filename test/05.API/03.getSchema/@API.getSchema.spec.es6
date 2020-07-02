const lib = require('../../../src/lib.es6');

const { prepareTestEnv, clearTestEnv, fnError } = require('../../test-utils.es6')({ __dirname });

const expectedSchema = lib.cloneDeep(require('../../resources/with-actual-values/schema---av.es6'));
const expectedSchemaRu = lib.cloneDeep(require('../../resources/with-actual-values/schema-ru---av.es6'));
const expectedSchemaEn = lib.cloneDeep(require('../../resources/with-actual-values/schema-en---av.es6'));

const tests = [
    [null, 'ru', expectedSchemaRu],
    ['', 'ru', expectedSchemaRu],
    ['', 'en', expectedSchemaEn],
    ['config1', 'en', expectedSchemaEn.value[0]],
    ['config1', 'ru', expectedSchemaRu.value[0]],
    ['config1', 'foo', expectedSchema.value[0]],
    ['config1.div13', 'ru', expectedSchemaRu.value[0].value[2]],
    ['config1.div13.v_email', 'ru', expectedSchemaRu.value[0].value[2].value[5]], // v_email
    ['config1.div13.v_json', 'ru', expectedSchemaRu.value[0].value[2].value[1]], // v_json
    ['config1.div13.v_json.defaultProp1', 'ru', 'error', /No such parameter/],
    ['config-2.div21', 'en', expectedSchemaEn.value[1].value[0]],
    ['config-5', 'en', 'error', /No such parameter/],
    ['config1.div13.foo', 'en', 'error', /No such parameter/],
];

describe('API: getSchema()', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('API');
    });

    tests.forEach(([paramPath, lng, expected, match]) => {
        it(`Path "${paramPath}" / ${lng}`, () => {
            if (expected === 'error') {
                expect(fnError(instance, 'getSchema', paramPath, lng)).to.match(match);
            } else {
                const testValue = instance.getSchema(paramPath, lng);
                expect(testValue).to.eql(expected);
            }
        });
    });

    after(clearTestEnv);
});
