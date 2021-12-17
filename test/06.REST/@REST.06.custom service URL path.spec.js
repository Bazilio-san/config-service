/* eslint-disable max-len */
const { initWS, get, stopWS } = require('./init-test-web-server.js');
const { clrRequire } = require('../test-utils.js')({ __dirname });

const altPath = '/cs/service/';

describe(`REST: custom service URL`, () => {
  let instance = {};
  before(() => {
        process.env.NODE_CONFIG_SERVICE_SERVICE_URL_PATH = altPath;
        clrRequire('./example/web-server.js');
        instance = initWS();
  });

  it(`Test alternative service URL path: "${altPath}"`, (done) => {
        get(`${instance.serviceUrlPath}?get=config1.div13.v_datetime`)
            .end((err, res) => {
                expect(res.body.value).to.eql('2020-02-28T11:12:13.456');
                done();
            });
  });

  after(stopWS);
});
