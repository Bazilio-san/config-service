/* eslint-disable max-len,no-console */
const {
    serviceOptions,
    API,
    prepareTestEnv,
    clearTestEnv
} = require('../../test-utils.es6')({ __dirname });

let testValue;

const onChange = (paramPath, newValue, schemaItem, cs, isJustInitialized) => {
    testValue = `${paramPath} / ${newValue} / ${schemaItem.id} / ${isJustInitialized}`;
};

describe('Check onChange method call', () => {
    let instance;
    before(() => {
        prepareTestEnv(false);
        const thisServiceOptions = {
            ...serviceOptions,
            onChange
        };
        instance = new API(thisServiceOptions);
    });

    it('Method onChange should work', () => {
        let expected = `config-2.c1_s0 / value is ONLY in the CONFIG / c1_s0 / true`;
        expect(testValue).equals(expected);
        const paramPath = 'config1.div13.v_string';
        const newValue = 'new value';
        const id = 'v_string';
        instance.set(paramPath, newValue);
        expected = `${paramPath} / ${newValue} / ${id} / ${false}`;
        expect(testValue).equals(expected);
    });

    it('A new value must be set', () => {
        expect(instance.get('config1.div13.v_string')).equals('new value');
    });

    it('The onChange method should not be triggered when a failure to set a new value', () => {
        const paramPath = 'config1.div13.v_email';
        instance.set(paramPath, 'new@value.com');
        const newValue = 'it is not a email';
        try {
            instance.set(paramPath, newValue);
        } catch (e) {
            console.log(e);
        }
        // testValue should not change since the onChange function was not called
        expect(testValue).equals('config1.div13.v_email / new@value.com / v_email / false');
        expect(instance.get(paramPath)).equals('new@value.com');
    });

    it('The onChange method should not be triggered when the onChange = false parameter is passed in the options', () => {
        const paramPath = 'config1.div13.v_email';
        instance.set(paramPath, 'another@value.com', { onChange: false });
        // testValue should not change since the onChange function was not called
        expect(testValue).equals('config1.div13.v_email / new@value.com / v_email / false');
        expect(instance.get(paramPath)).equals('another@value.com');
    });

    after(clearTestEnv);
});
