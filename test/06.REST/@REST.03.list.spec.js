const { cu, initWS, get } = require('./init-test-web-server.js');

describe(`REST: get-config-names`, () => {
  before(initWS);

  it('configs list', (done) => {
        get(`${cu}list`)
            .end((err, res) => {
                // expect(res.statusCode).to.equal(200);
                // expect(res.body).to.be.an('object');
                expect(res.body).to.eql([
                  'config1',
                  'config-2',
                  'config 3'
                ]);
                done();
            });
  });
});
