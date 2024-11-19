const request = require('supertest');

let webApp;

module.exports = {
  cu: '/config-service?',
  async initWS () {
    const initWebServer = require('../../example/web-server.js');
    webApp = await initWebServer();
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
