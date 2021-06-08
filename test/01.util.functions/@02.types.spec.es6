/* eslint-disable no-unused-expressions */
const Utils = require('../../src/Utils.es6');

const csu = new Utils();

const lib = require('../../src/lib.es6');

const schemaDataTypes = [
    'section',
    'json',
    'array',
    'string',
    'text',
    'date',
    'time',
    'datetime',
    'email',
    'number',
    'int',
    'long',
    'float',
    'double',
    'money',
    'bool',
    'boolean'
];

const realTypes = {
    'object': {},
    'array': [],
    'string': '',
    'number': 3,
    'boolean': true
};

describe('Utils: Type checking methods should works properly', () => {
    describe('Method _schemaDataTypeExists...', () => {
        schemaDataTypes.forEach((schemaDataType) => {
            it(`"${schemaDataType}" schema data type must exist`, () => {
                expect(csu._schemaDataTypeExists(schemaDataType)).to.be.true;
            });
        });

        it('Unknown schema data type must not exist', () => {
            expect(csu._schemaDataTypeExists('foo')).to.be.false;
        });
    });

    describe('Method _detectRealType()...', () => {
        lib.each(realTypes, (value, type) => {
            it(`Checking the real type of "${type}"`, () => {
                expect(csu._detectRealType(value)).equal(type);
            });
        });
    });

    describe('Method _validateType()...', () => {
        const cases = [
            ['section', 'array', true],

            ['json', 'string', true],
            ['json', 'object', true],
            ['json', 'array', true],
            ['json', 'number', true],
            ['json', 'null', true],

            ['array', 'array', true],
            ['array', 'null', true],

            ['string', 'string', true],
            ['string', 'object', true],
            ['string', 'array', true],
            ['string', 'number', true],
            ['string', 'null', true],

            ['text', 'string', true],
            ['text', 'null', true],

            ['date', 'string', true],
            ['date', 'null', true],

            ['email', 'string', true],
            ['email', 'null', true],

            ['number', 'number', true],
            ['number', 'string', true],
            ['number', 'null', true],

            ['int', 'number', true],
            ['int', 'string', true],
            ['int', 'null', true],

            ['long', 'number', true],
            ['long', 'string', true],
            ['long', 'null', true],

            ['float', 'number', true],
            ['float', 'string', true],
            ['float', 'null', true],

            ['double', 'number', true],
            ['double', 'string', true],
            ['double', 'null', true],

            ['money', 'number', true],
            ['money', 'string', true],
            ['money', 'null', true],

            ['bool', 'boolean', true],
            ['boolean', 'null', true],

            ['bool', 'boolean', true],
            ['boolean', 'null', true],

            ['foo', 'boolean', false],
            [null, null, false],
            ['boolean', null, false],
            ['email', 'number', false]
        ];
        cases.forEach(([schemaDataType, type, result]) => {
            it(`"${schemaDataType}" schema data type corresponds to type "${type}" - "${result}"`, () => {
                expect(csu._validateType(type, schemaDataType)).equal(result);
            });
        });
    });

    describe('Method _validateValueByType()...', () => {
        [
            ['json', null, true],
            ['array', null, true],
            ['string', null, true],
            ['text', null, true],
            ['date', null, true],
            ['time', null, true],
            ['datetime', null, true],
            ['email', null, true],
            ['number', null, true],
            ['int', null, true],
            ['long', null, true],
            ['float', null, true],
            ['double', null, true],
            ['money', null, true],
            ['bool', null, true],
            ['boolean', null, true],

            ['section', [], true],
            // When passing the parameter object for saving to the set method,
            // the type 'section' must accept an object.
            ['section', {}, true],
            ['section', { a: 0, c: 3 }, true],

            ['json', { b: 1 }, true],
            ['json', 1, true],
            ['json', [1, 3], true],
            ['json', 'dddd', true],
            ['json', true, true],
            ['array', [1, 2], true],
            ['string', 'sssss', true],
            ['string', { a: 1 }, true],
            ['string', 99, true],
            ['string', true, true],
            ['string', false, true],
            ['text', 'tttt', true],
            ['date', '2020-04-04', true],
            ['time', '10:30:01.456', true],
            ['datetime', '2020-04-04 10:30:01.456', true],
            ['email', 'user@domain.com', true],
            ['number', 123, true],
            ['number', 'string may represent a number', true],
            ['int', 345, true],
            ['int', 'string may represent a number', true],
            ['long', 345, true],
            ['long', 'string may represent a number', true],
            ['float', 567.89, true],
            ['float', 'string may represent a number', true],
            ['double', 567.89, true],
            ['double', 'string may represent a number', true],
            ['money', 567.89, true],
            ['money', 'string may represent a number', true],
            ['bool', true, true],
            ['boolean', true, true],
            //
            ['section', 'ssss', false],

            ['json', () => {
            }, false],
            ['array', 1, false],
            ['text', ['arr'], false],
            ['date', 2, false],
            ['time', true, false],
            ['datetime', ['arr'], false],
            ['email', 2, false],
            ['int', {}, false],
            ['long', {}, false],
            ['float', ['555'], false],
            ['double', ['555'], false],
            ['bool', [], false],
            ['boolean', [], false]
        ].forEach(([schemaDataType, realValue, expected]) => {
            it(`${realValue} -> ${schemaDataType} -> ${expected}`, () => {
                expect(csu._validateValueByType(realValue, schemaDataType)).to.equals(expected);
            });
        });
    });
});
