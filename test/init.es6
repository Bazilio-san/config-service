const path = require('path');

process.env.NODE_CONFIG_DIR = path.resolve(`${__dirname}/../example/config`);
process.env.NODE_ENV = 'testing';
process.env.LOGGER_LEVEL = 'debug';
process.env.SUPPRESS_NO_CONFIG_WARNING = 1;

const { clearTestEnv } = require('./test-utils.es6')({ __dirname });

const { loggerFinish } = require('../example/logger-service.es6');

describe('_INIT: Testing environment should be set properly', () => {
    it('NODE_ENV should be "testing"', () => {
        expect(process.env.NODE_ENV).to.equal('testing');
    });
    it('NODE_CONFIG_DIR should be "testing"', () => {
        const nodeConfigDir = path.resolve(process.env.NODE_CONFIG_DIR);
        const expected = path.resolve(`${__dirname}/config`).replace(/\btest\b/, 'example');
        expect(nodeConfigDir).to.equal(expected);
    });
    it('LOGGER_LEVEL should be "debug"', () => {
        const currentLevel = process.env.LOGGER_LEVEL;
        expect(currentLevel).to.equal('debug');
    });
});

after(() => {
    clearTestEnv();
    loggerFinish(0);
});
