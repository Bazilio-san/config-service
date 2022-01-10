/* eslint-disable max-len */
const { initWS, get, stopWS } = require('./init-test-web-server.js');
const { clrRequire } = require('../test-utils.js')({ __dirname });

const altPath = '/cs/service/';

describe(`REST: custom service URL`, () => {
  let instance = {};
  beforeAll(() => {
        process.env.NODE_CONFIG_SERVICE_SERVICE_URL_PATH = altPath;
        clrRequire('./example/web-server.js');
        instance = initWS();
  });

  test(`Test alternative service URL path: "${altPath}"`, (done) => {
        get(`${instance.serviceUrlPath}?get=config1.div13.v_datetime`)
            .end((err, res) => {
                expect(res.body.value).toMatchObject('2020-02-28T11:12:13.456');
                done();
            });
  });

  after(stopWS);
});
