module.exports = {
  isNamedConfig: true,
  paramName: 'config1',
  paramPath: 'config1',
  value: {
    div11: { div21: { div31: { div41: 'NEW by _updateAndSaveNamedConfig()' } } },
    div10: '!!!НОВАЯ СТРОКА!!!',
    div13: {
      v_section_empty: {},
      v_json: { a: 'NEW by _updateAndSaveNamedConfig()', b: 123 },
      v_array: ['NEW by _updateAndSaveNamedConfig()'],
      v_string: 'NEW by _updateAndSaveNamedConfig()',
      v_text: '\nМного\nстрочный\nтекст',
      v_email: 'new.value-of@email-123.test.com',
      v_date: '2020-02-28',
      v_time: '11:12:13.456',
      v_datetime: '2020-02-28T11:12:13.456',
      v_number: 123,
      v_int: 456,
      v_float: 456.7890123,
      v_money: 456.7891432,
      v_boolean: true,
    },
  },
  defaultValue: {
    div11: { div21: { div31: { div41: 'default string' } } },
    div10: 'DEFAULT string',
    div13: {
      v_section_empty: null,
      v_json: {
        defaultProp1: { a: 2 },
        defaultProp2: [
          'a',
          'r',
          'r',
        ],
        defaultProp3: 'sssss',
        defaultProp4: 555,
        defaultProp5: true,
        defaultProp6: null,
      },
      v_array: [
        111,
        222,
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
      v_boolean: true,
    },
  },
};
