const { cu, initWS, get } = require('./init-test-web-server.js');

describe(`REST: get-config-names`, () => {
  beforeAll(initWS);

  test('configs list', (done) => {
        get(`${cu}list`)
            .end((err, res) => {
                // expect(res.statusCode).toEqual(200);
                // expect(res.body).to.be.an('object');
                expect(res.body).toMatchObject([
                  'config1',
                  'config-2',
                  'config 3'
                ]);
                done();
            });
  });
});
