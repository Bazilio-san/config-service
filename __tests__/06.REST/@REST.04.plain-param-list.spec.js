/* eslint-disable max-len */

const lib = require('../../src/lib.js');
const { cu, get } = require('./init-test-web-server.js');

const expectedListFull = lib.cloneDeep(require('../05.API/08.plainParamsList/list-full.json'));
const expectedList = lib.cloneDeep(require('../05.API/08.plainParamsList/list.json'));
const expectedListEx = lib.cloneDeep(require('../05.API/08.plainParamsList/list_extended.json'));

describe(`REST: get & set`, () => {
  const urlFull = `${cu}plain-params-list`;
  test(`"${urlFull}" --> full params-list`, (done) => {
        get(urlFull).end((err, res) => {
            expect(res.body).toMatchObject(expectedListFull);
            done();
        });
  });

  const url1 = `${cu}plain-params-list=config1`;
  test(`"${url1}" --> params-list of config1`, (done) => {
        get(url1).end((err, res) => {
            expect(res.body).toMatchObject(expectedList);
            done();
        });
  });

  const urlEx = `${cu}plain-params-list-ex=config1`;
  test(`"${urlEx}" --> params-list of config1 (extended)`, (done) => {
        get(urlEx).end((err, res) => {
            expect(res.body).toMatchObject(expectedListEx);
            done();
        });
  });
});
