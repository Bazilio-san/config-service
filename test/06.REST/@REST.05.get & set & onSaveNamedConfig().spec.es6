/* eslint-disable max-len */
const { cloneDeep, each } = require('../../src/lib.es6');
const { cu, initWS, get, post, stopWS } = require('./init-test-web-server.es6');

const expected = require('../resources/with-actual-values/expected-config--get.es6');

const expected12 = cloneDeep(expected);

const newValues = [
    ['config 3.div31', null],
    ['config1.div13.v_json', { a: 1 }],
    ['config-2.div21', [{ f: 2 }, { g: 3 }]],
    ['config1.div10', '!!!НОВАЯ СТРОКА!!!'],
    ['config1.div13.v_email', 'new.value-of@email-123.test.com']
];
const unchangedValues = [
    ['', expected],
    [null, expected],
    ['config1', expected.config1],
    ['config-2.div22', [10, 20, 30]],
    ['config1.div13.v_int', 456],
    ['config1.div13.v_datetime', '2020-02-28T11:12:13.456'],
    ['config1.div13.v_float', 456.7890123]
];

describe(`REST: get & set`, () => {
    let instance;
    before(() => {
        instance = initWS();
    });

    describe(`ERRORS...`, () => {
        [
            ['set', 'config1.div13.v_json', null, /No root parameter .value. was found/],
            ['set', '', { value: 'newVal' }, /Passed empty parameter value .set./],
            ['set', 'config1.div13.v_email', { value: 99999 }, /The real type .+ not match schema data type/],
            ['set', 'config1.div13.v_email', { value: '99999' }, /Validation error/]
        ].forEach(([fn, paramPath, value, re]) => {
            it(`ERROR (${fn}): ${re.source}`, (done) => {
                post(`${cu}${fn}=${paramPath}`)
                    .send(value)
                    .expect(500)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.body.err.message).to.match(re);
                        done();
                    });
            });
        });
    });

    describe(`set new params`, () => {
        newValues.forEach(([paramPath, newVal]) => {
            const query = `set=${paramPath}`;
            it(`"${query}"`, (done) => {
                post(`${cu}${query}`)
                    .send({ value: newVal })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        // expect(res.statusCode).to.equal(200);
                        // expect(res.body).to.be.an('object');
                        expect(res.body).to.eql(true);
                        done();
                    });
            });

            it('Method onChange() should work', () => {
                const testValue = instance.testOnChange;
                const expected_ = paramPath + newVal;
                expect(testValue).equals(expected_);
            });

            it('Method onSaveNamedConfig() should work', () => {
                const testValue = instance.testOnSaveNamedConfig;
                const expected_ = paramPath.split('.')[0];
                expect(testValue).equals(expected_);
            });
        });
    });

    describe(`OnChange () method should not be called if noonchange parameter is passed`, () => {
        const paramPath = 'config1.div13.v_time';
        const oldVal = '11:12:13.456';
        const newVal1 = '01:01:01.777';

        it(`Seting new value by "set=${paramPath}&noonchange" and checking that the onChange method was NOT called`, (done) => {
            instance.testOnChange = 'foo';
            post(`${cu}set=${paramPath}&noonchange`)
                .send({ value: newVal1 })
                .expect(200)
                .expect('Content-Type', /json/)
                .end(() => {
                    expect(instance.testOnChange).equals('foo');
                    done();
                });
        });

        it(`Checking a new value by "get":`, (done) => {
            get(`${cu}get=${paramPath}`)
                .end((err, res) => {
                    expect(res.body.value).to.eql(newVal1);
                    done();
                });
        });

        it(`Rolling back old value by call "set=${paramPath}" and checking that the onChange method was called`, (done) => {
            post(`${cu}set=${paramPath}`)
                .send({ value: oldVal })
                .expect(200)
                .expect('Content-Type', /json/)
                .end(() => {
                    expect(instance.testOnChange).equals(paramPath + oldVal);
                    done();
                });
        });

        it(`Checking an old value by "get":`, (done) => {
            get(`${cu}get=${paramPath}`)
                .end((err, res) => {
                    expect(res.body.value).to.eql(oldVal);
                    done();
                });
        });
    });

    describe(`Checking a new values by "get":`, () => {
        each(expected12, (configExpected, configName) => {
            it(`Named config: "${configName}"`, (done) => {
                get(`${cu}get=${configName}`)
                    .end((err, res) => {
                        expect(res.body.value).to.eql(configExpected);
                        done();
                    });
            });
        });
        [...newValues, ...unchangedValues].forEach(([paramPath, paramValue]) => {
            it(`Path: "${paramPath}"`, (done) => {
                get(`${cu}get${paramPath === null ? '' : `=${paramPath}`}`)
                    .end((err, res) => {
                        expect(res.body.value).to.eql(paramValue);
                        done();
                    });
            });
        });
    });

    after(stopWS);
});
