const path = require('path');

describe('_INIT: Testing environment should be set properly', () => {
  test('NODE_ENV should be "test"', () => {
        expect(process.env.NODE_ENV).toEqual('test');
  });
  test('NODE_CONFIG_DIR should be "__tests__"', () => {
    const nodeConfigDir = path.resolve(process.env.NODE_CONFIG_DIR);
    const expected = path.resolve(`${__dirname}/config`).replace(/__tests__[/\\]00\.ENV\b/, 'example');
        expect(nodeConfigDir).toEqual(expected);
  });
  test('LOGGER_LEVEL should be "debug"', () => {
    const currentLevel = process.env.LOGGER_LEVEL;
        expect(currentLevel).toEqual('debug');
  });
});
