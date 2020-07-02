module.exports = {
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
        v_boolean: false,

        // unchanged
        v_section_empty: {},
        v_date: '2020-02-28',
        v_number: 123,
        v_int: 456,
    }
};
