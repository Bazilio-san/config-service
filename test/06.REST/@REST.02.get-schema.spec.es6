const { cloneDeep } = require('../../src/lib.es6');
const { cu, initWS, get } = require('./init-test-web-server.es6');

const expectedSchema = cloneDeep(require('../resources/with-actual-values/schema---av.es6'));
const expectedSchemaRu = cloneDeep(require('../resources/with-actual-values/schema-ru---av.es6'));
const expectedSchemaEn = cloneDeep(require('../resources/with-actual-values/schema-en---av.es6'));

describe(`REST: Method "get-schema" should work properly`, () => {
    before(initWS);

    [
        `get-schema`,
        `get-schema=`,
        `get-schema=.`
    ].forEach((query) => {
        it(`"${cu}${query}" --> full schema`, (done) => {
            get(`${cu}${query}`)
                .expect(expectedSchema)
                .end(done);
        });
    });

    [
        ['ru', expectedSchemaRu, 'Russian'],
        ['en', expectedSchemaEn, 'English'],
        ['foo', expectedSchema, 'unknown lang']
    ].forEach(([lng, expected, name]) => {
        const url = `${cu}get-schema&lng=${lng}`;
        it(`"${url}" --> full schema for ${name}`, (done) => {
            get(url)
                .expect(expected)
                .end(done);
        });
    });

    [
        ['', 'ru', expectedSchemaRu],
        ['config1', 'ru', expectedSchemaRu.value[0]],
        ['config1', 'en', expectedSchemaEn.value[0]],
        ['config1', 'foo', expectedSchema.value[0]],
        ['config1.div13', 'ru', expectedSchemaRu.value[0].value[2]],
        ['config1.div13.v_email', 'ru', expectedSchemaRu.value[0].value[2].value[5]], // v_email
        ['config-2.div21', 'en', expectedSchemaEn.value[1].value[0]],
        ['config-5', 'en', 'error', /No such parameter/],
        ['config1.div13.foo', 'en', 'error', /No such parameter/],
        ['config1.div13.v_json.defaultProp1', 'ru', 'error', /No such parameter/],
    ].forEach(([paramPath, lng, expected, match]) => {
        const url = `${cu}get-schema=${paramPath}&lng=${lng}`;
        it(`"${url}"`, (done) => {
            if (expected === 'error') {
                get(url)
                    .expect(500)
                    .expect((res) => {
                        expect(res.body.err.message).to.match(match);
                    })
                    .end(done);
            } else {
                get(url)
                    .expect(expected)
                    .end(done);
            }
        });
    });
});
