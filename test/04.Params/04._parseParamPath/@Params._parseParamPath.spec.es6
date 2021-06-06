/* eslint-disable no-unused-expressions */

const { prepareTestEnv, clearTestEnv, fnError } = require('../../test-utils.es6')({ __dirname });

const forRoot = require('./path_-_.es6');
const forLongPath = require('./path_-_config1_div11_div21_div31_div41.es6');

describe('Params: _parseParamPath()', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('Params');
    });

    [
        ['config1', require('./path_-_config1.es6')],
        ['', forRoot],
        [[], forRoot],
        [null, forRoot],
        ['config1.div11', require('./path_-_config1_div11.es6')],
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
