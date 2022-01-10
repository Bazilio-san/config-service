module.exports = {
  config1: {
    div10: 'ACTUAL value',
    div11: { div21: { div31: { div41: 'ACTUAL string' } } },
    div13: {
      v_section_empty: {},
      v_json: {
        defaultProp1: { a: 2 },
        defaultProp2: ['a', 'r', 'r'],
        defaultProp3: 'sssss',
        defaultProp4: 555,
        defaultProp5: true,
        defaultProp6: null
      },
      v_array: [
        111,
        222
      ],
      v_string: 'any string',
      v_text: '\nМного\nстрочный\nтекст',
      v_email: 'default@value.com',
      v_date: '2020-02-28',
      v_time: '11:12:13.456',
      v_datetime: '2020-02-28T11:12:13.456',
      v_number: 123,
      v_int: 456,
      v_float: 456.7890123,
      v_money: 456.7891432,
      v_boolean: true
    }
  },
  'config-2': {
    div21: [
      'ACTUAL array',
      123
    ],
    div22: [
      10,
      20,
      30
    ],
    c0_s0: null,
    c1_s0: 'value is ONLY in the CONFIG'
  },
  'config 3': {
    div31: 'какая-то строка',
    div32: 'какая-то строка'
  }
};
