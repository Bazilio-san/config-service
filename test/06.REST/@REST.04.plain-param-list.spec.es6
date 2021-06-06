/* eslint-disable max-len */

const lib = require('../../src/lib.es6');
const { cu, get } = require('./init-test-web-server.es6');

const expectedListFull = lib.cloneDeep(require('../05.API/08.plainParamsList/list-full.json'));
const expectedList = lib.cloneDeep(require('../05.API/08.plainParamsList/list.json'));
const expectedListEx = lib.cloneDeep(require('../05.API/08.plainParamsList/list_extended.json'));

describe(`REST: get & set`, () => {
    const urlFull = `${cu}plain-params-list`;
    it(`"${urlFull}" --> full params-list`, (done) => {
        get(urlFull).end((err, res) => {
            expect(res.body).to.eql(expectedListFull);
            done();
        });
    });

    const url1 = `${cu}plain-params-list=config1`;
    it(`"${url1}" --> params-list of config1`, (done) => {
        get(url1).end((err, res) => {
            expect(res.body).to.eql(expectedList);
            done();
        });
    });

    const urlEx = `${cu}plain-params-list-ex=config1`;
    it(`"${urlEx}" --> params-list of config1 (extended)`, (done) => {
        get(urlEx).end((err, res) => {
            expect(res.body).to.eql(expectedListEx);
            done();
        });
    });
});
