/* eslint-disable no-unused-expressions,import/no-dynamic-require */
const __ = require('../../../../src/lib.es6');
const {
    prepareTestEnv,
    clrRequire,
    clearTestEnv,
    API
} = require('../../../test-utils.es6')({ __dirname });

const configDir = API.getConfigDir();

const change1 = {
    div10: 'CHANGE 1',
    div11: { div21: { div31: { div41: 'CHANGE 1' } } },
    div13: {
        v_json: {
            defaultProp1: { '1': 'CHANGE 1' },
            defaultProp2: ['CHANGE 1'],
            defaultProp3: 'CHANGE 1',
            defaultProp4: 111,
            defaultProp5: null,
            defaultProp6: false
        },
        v_array: ['CHANGE 1'],
        v_string: 'CHANGE 1',
        v_text: 'CHANGE 1',
        v_email: 'CHANGE_1_@mass.change',
        v_time: '11:11:11.111',
        v_datetime: '2111-11-11T11:11:11.111',
        v_float: 11.111,
        v_money: 11.111,
        v_boolean: false
    }
};
const chaqnge2 = {
    v_string: 'CHANGE 2',
    v_text: 'CHANGE 2',
    v_email: 'CHANGE_2_@mass.change',
    v_date: '2222-02-22',
    v_number: 222,
    v_json: {
        Prop1: { '2': 'CHANGE 2' },
        Prop6: {
            Prop2: ['CHANGE 2'],
            Prop4: {
                Prop1: { a: 'CHANGE 2' },
                Prop6: false
            },
            Prop5: null,
        }
    },
};

const changes = [
    ['config1', change1],
    ['config1.div13', chaqnge2],
    ['config1.div11.div21.div31', { div41: 'CHANGE 3' }],
    ['config1.div11.div21.div31.div41', 'CHANGE 4']
];

describe('API: checking values in the set() and get chain()', () => {
    let instance;
    before(() => {
        instance = prepareTestEnv('API');
    });

    // ====================== 2 =====================================
    changes.forEach(([paramPath, newValue], i) => {
        const n = i + 1;
        const expected = require(`./result${n}.es6`);
        const expectedSchema = require(`./result-schema${n}.es6`);
        const expectedSchemaRu = require(`./result-schema${n}-ru.es6`);

        const path = paramPath.replace(/^config1\.?/, '');
        describe(`Change ${n}`, () => {
            it(`set()`, () => {
                expect(instance.set(paramPath, newValue)).equals(true);
            });

            it(`get('config1'}`, () => {
                instance.set(paramPath, newValue);
                const paramValue = instance.get('config1');
                expect(paramValue).to.eql(expected);
            });

            it(`get('${paramPath}')`, () => {
                const paramValue = instance.get(paramPath);
                const expectedFragment = path ? __.get(expected, path) : expected;
                expect(paramValue).to.eql(expectedFragment);
            });

            it(`_getValues()`, () => {
                const config = instance._getValues();
                expect(config.config1).to.eql(expected);
            });

            it(`getSchema()`, () => {
                const val = instance.getSchema();
                expect(val).to.eql(expectedSchema);
                // const realValue = path ? __.get(expectedSchema, path) : expectedSchema;
                const values = instance._getValuesFromSchemaFragment(val).__root__.config1;
                expect(values).to.eql(expected);
            });

            it(`getSchema(null, 'ru')`, () => {
                const val = instance.getSchema(null, 'ru');
                expect(val).to.eql(expectedSchemaRu);
                const values = instance._getValuesFromSchemaFragment(val).__root__.config1;
                expect(values).to.eql(expected);
            });

            it(`getSchema('${paramPath}')`, () => {
                const val = instance.getSchema(paramPath);
                const values = instance._getValuesFromSchemaFragment(val);
                const expectedFragment = path ? __.get(expected, path) : expected;
                const result = path ? values[path.split('.').pop()] : values.config1;
                expect(result).to.eql(expectedFragment);
            });

            it(`getSchema('${paramPath}', 'ru')`, () => {
                const val = instance.getSchema(paramPath, 'ru');
                const values = instance._getValuesFromSchemaFragment(val);
                const expectedFragment = path ? __.get(expected, path) : expected;
                const result = path ? values[path.split('.').pop()] : values.config1;
                expect(result).to.eql(expectedFragment);
            });

            it(`localized schema`, () => {
                const realValue = instance._getSchemaByLanguage('ru');
                const values = instance._getValuesFromSchemaFragment(realValue).__root__.config1;
                expect(values).to.eql(expected);
            });

            it(`Named configuration file`, () => {
                clrRequire(`${configDir}/config1.json`);
                // eslint-disable-next-line import/no-dynamic-require
                const content = require(`${configDir}/config1.json`);
                expect(content).to.eql(expected);
            });
        });
    });

    // ====================== 5 =====================================

    after(clearTestEnv);
});
