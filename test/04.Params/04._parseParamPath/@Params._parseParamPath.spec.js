/* eslint-disable no-unused-expressions */

const { prepareTestEnv, clearTestEnv, fnError } = require('../../test-utils.js')({ __dirname });

const forRoot = require('./path_-_.js');
const forLongPath = require('./path_-_config1_div11_div21_div31_div41.js');

describe('Params: _parseParamPath()', () => {
  let instance;
  before(async () => {
    instance = await prepareTestEnv('Params');
  });

  [
    ['config1', require('./path_-_config1.js')],
    ['', forRoot],
    [[], forRoot],
    [null, forRoot],
    ['config1.div11', require('./path_-_config1_div11.js')],
    ['config1.div11.div21.div31.div41', forLongPath],
    [['config1', 'div11', 'div21', 'div31', 'div41'], forLongPath],
    ['foo.bar', {}, 'error'],
    [['foo', 'bar', 'baz'], {}, 'error']
  ].forEach(([path, expected, error]) => {
    if (error) {
      it(`Checking parsing path "${path}" should fail`, () => {
        expect(fnError(instance, '_parseParamPath', path, { callFrom: 'test' })).to.match(/No such parameter/);
      });
    } else {
      it(`Checking parsing path "${path}"`, () => {
        const result = instance._parseParamPath(path, { callFrom: 'test' });
        expect(result).to.eql(expected);
      });
    }
  });

  it('The parsed path should be in the cache', () => {
    expect(instance.pathsOfSchemaItems.has('config1.div11.div21.div31.div41')).to.be.true;
  });

  after(clearTestEnv);
});
