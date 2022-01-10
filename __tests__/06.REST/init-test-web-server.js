const request = require('supertest');

let webApp;

module.exports = {
  cu: '/config-service?',
  initWS () {
    const ws = require('../../example/web-server.js');
    ({ webApp } = ws);
    return webApp.configServiceREST;
  },
  get (url) {
    return request(webApp).get(url);
  },
  post (url) {
    return request(webApp).post(url);
  },
  stopWS () {
    if (webApp && webApp.webServer && typeof webApp.webServer.close === 'function') {
      webApp.webServer.close();
    }
  }
};
