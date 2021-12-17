/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

process.env.NODE_CONFIG_DIR = path.resolve(`${__dirname}/config`);

const express = require('express');
const app = require('express')();
const webServer = require('http').Server(app);
const echo = require('af-echo');

const { errorLogger, loggerFinish } = require('./logger-service.es6');
const i18n = require('./i18n/i18n.es6')();

if (!process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR) {
    process.env.NODE_CONFIG_SERVICE_SCHEMA_DIR = path.resolve(path.join(__dirname, './config/service'));
}

const tu = require('../test/test-utils.es6')({ __dirname });

tu.prepareTestEnv(false);

const REST = require('../src/REST.es6');

const serviceOptions = {
    errorLogger,
    loggerFinish,
    i18n,
    i18nNS: 'cs',
    translatedProperties: ['descr'],
    _afLibEcho: echo,
    onChange: ({ paramPath, newValue, schemaItem, csInstance }) => {
        csInstance.testOnChange = paramPath + newValue;
    },
    onSaveNamedConfig: (configName, instance) => {
        instance.testOnSaveNamedConfig = configName;
    }
};

if (process.env.NODE_CONFIG_SERVICE_SERVICE_URL_PATH) {
    serviceOptions.serviceUrlPath = process.env.NODE_CONFIG_SERVICE_SERVICE_URL_PATH;
}

const cs = new REST(serviceOptions);

app.configServiceREST = cs;

const { rest } = cs;

app.use(express.json()); // to support JSON-encoded bodies
// app.use(express.urlencoded());

app.use(rest);

app.use((req, res) => {
    res.status(501).send('Not Implemented');
});
const httpPort = 8683;
const httpHost = 'localhost';

function g (m) {
    echo.echo(m, { colorNum: echo.Green, bold: true });
}

webServer.listen(httpPort, httpHost, () => {
    g('\n');
    g('=======================================================================');
    g(`Web-Server listening on http://${httpHost}:${httpPort}`);
    g('=======================================================================\n');
});
app.webServer = webServer;
module.exports.webApp = app;
