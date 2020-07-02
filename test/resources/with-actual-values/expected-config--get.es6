module.exports = {
    config1: {
        div11: { 'div21': { 'div31': { 'div41': 'ACTUAL string' } } },
        div10: '!!!НОВАЯ СТРОКА!!!',
        div13: {
            v_section_empty: {},
            v_json: { a: 1 },
            v_array: [
                111,
                222
            ],
            v_string: 'any string',
            v_text: '\nМного\nстрочный\nтекст',
            v_email: 'new.value-of@email-123.test.com',
            v_date: '2020-02-28',
            v_time: '11:12:13.456',
            v_datetime: '2020-02-28T11:12:13.456',
            v_number: 123,
            v_int: 456,
            v_float: 456.7890123,
            v_money: 456.7891432,
            v_boolean: true
        },
    },
    'config-2': {
        c0_s0: null,
        c1_s0: 'value is ONLY in the CONFIG',
        div21: [{ f: 2 }, { g: 3 }],
        div22: [
            10,
            20,
            30
        ]
    },
    'config 3': {
        div31: null,
        div32: 'какая-то строка'
    }
};
