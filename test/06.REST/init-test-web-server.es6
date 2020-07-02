const request = require('supertest');

let webApp;

module.exports = {
    cu: '/config-service?',
    initWS () {
        const ws = require('../../example/web-server.es6');
        webApp = ws.webApp;
        return webApp.configServiceREST;
    },
    get (url) {
        return request(webApp).get(url);
    },
    post (url) {
        return request(webApp).post(url);
    }
};
