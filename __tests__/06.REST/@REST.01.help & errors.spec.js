const { initWS, get } = require('./init-test-web-server.js');

describe(`REST: help & errors`, () => {
  beforeAll(initWS);

  describe(`Help request`, () => {
    test(`[200] + markdown help`, (done) => {
            get('/config-service/help')
                .expect(200)
                .expect('Content-Type', /markdown/)
                .end((err, res) => {
                    expect(res.text).match(/# Config Service Help/);
                    done();
                });
    });
  });

  describe(`Requests with invalid parameters should return an error + help link`, () => {
        [
          '/config-service',
          '/config-service?',
          '/config-service?foo',
          '/config-service?bar=1',
          '/config-service/',
          '/config-service/foo'
        ].forEach((url) => {
          test(`"${url}" --> 500 + help`, (done) => {
                get(url)
                    .expect(500)
                    .expect('Content-Type', /json/)
                    .expect((res) => {
                      const { message, name, help } = res.body.err;
                        res.body.err = { message, name, help };
                    })
                    .expect({
                      err: {
                        message: 'Invalid request',
                        name: 'ConfigServiceError',
                        help: '/config-service/help'
                      }
                    })
                    .end(done);
          });
        });
  });

  describe(`Invalid queries returning 501 (Not Implemented)`, () => {
        [
          '/',
          '/any/other/path.html'
        ].forEach((url) => {
          test(`"${url}" --> 500 + help`, (done) => {
                get(url)
                    .expect(501)
                    .end(done);
          });
        });
  });
});
