module.exports = {
  paramPath: 'config1',
  pathArr: ['config1'],
  pathParent: [],
  lastParamName: 'config1',
  configName: 'config1',
  schemaDataType: 'section',
  schemaItem: {
    id: 'config1',
    path: 'config1',
    title: 'config1 title',
    t: 'cs:config1.title',
    anyOtherProperty: 'any other value',
    descr: 'cs:config1.descr',
    type: 'section',
    value: [
      {
        id: 'div10',
        path: 'config1.div10',
        type: 'string',
        title: 'div10 - This title has a translation',
        t: 'cs:config1.div10.title',
        defaultValue: 'DEFAULT string',
        value: 'ACTUAL value'
      },
      {
        id: 'div11',
        path: 'config1.div11',
        type: 'section',
        title: 'div11 title',
        t: 'cs:config1.div11.title',
        value: [
          {
            id: 'div21',
            path: 'config1.div11.div21',
            type: 'section',
            title: 'div21 title',
            value: [
              {
                id: 'div31',
                path: 'config1.div11.div21.div31',
                type: 'section',
                title: 'div31 title',
                t: 'cs:config1.div11.div21.div31.title',
                value: [
                  {
                    id: 'div41',
                    path: 'config1.div11.div21.div31.div41',
                    type: 'string',
                    title: 'div41 title',
                    t: 'cs:config1.div11.div21.div31.div41.title',
                    defaultValue: 'default string',
                    value: 'ACTUAL string'
                  }
                ]
              }
            ],
            t: 'cs:config1.div11.div21.title'
          }
        ]
      },
      {
        id: 'div13',
        path: 'config1.div13',
        type: 'section',
        title: 'div13 ORIGINAL TITLE - There are no translations for this title',
        t: 'cs:config1.div13.title',
        value: [
          {
            id: 'v_section_empty',
            path: 'config1.div13.v_section_empty',
            type: 'section',
            title: 'div1 [section empty] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_section.title',
            value: []
          },
          {
            id: 'v_json',
            path: 'config1.div13.v_json',
            type: 'json',
            title: 'div1 [json] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_json.title',
            defaultValue: {
              defaultProp1: { a: 2 },
              defaultProp2: [
                'a',
                'r',
                'r'
              ],
              defaultProp3: 'sssss',
              defaultProp4: 555,
              defaultProp5: true,
              defaultProp6: null
            },
            value: {
              defaultProp1: { a: 2 },
              defaultProp2: [
                'a',
                'r',
                'r'
              ],
              defaultProp3: 'sssss',
              defaultProp4: 555,
              defaultProp5: true,
              defaultProp6: null
            }
          },
          {
            id: 'v_array',
            path: 'config1.div13.v_array',
            type: 'array',
            title: 'div1 [array] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_array.title',
            defaultValue: [
              111,
              222
            ],
            value: [
              111,
              222
            ]
          },
          {
            id: 'v_string',
            path: 'config1.div13.v_string',
            type: 'string',
            title: 'div1 [string] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_string.title',
            defaultValue: 'any string',
            value: 'any string'
          },
          {
            id: 'v_text',
            path: 'config1.div13.v_text',
            type: 'text',
            title: 'div1 [text] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_text.title',
            defaultValue: '\nМного\nстрочный\nтекст',
            value: '\nМного\nстрочный\nтекст'
          },
          {
            id: 'v_email',
            path: 'config1.div13.v_email',
            type: 'email',
            title: 'div1 [email] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_email.title',
            defaultValue: 'default@value.com',
            value: 'default@value.com'
          },
          {
            id: 'v_date',
            path: 'config1.div13.v_date',
            type: 'date',
            title: 'div1 [date] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.div13.v_date.title',
            defaultValue: '2020-02-28',
            value: '2020-02-28'
          },
          {
            id: 'v_time',
            path: 'config1.div13.v_time',
            type: 'time',
            title: 'div1 [time] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_time.title',
            defaultValue: '11:12:13.456',
            value: '11:12:13.456'
          },
          {
            id: 'v_datetime',
            path: 'config1.div13.v_datetime',
            type: 'datetime',
            title: 'div1 [datetime] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_datetime.title',
            defaultValue: '2020-02-28T11:12:13.456',
            value: '2020-02-28T11:12:13.456'
          },
          {
            id: 'v_number',
            path: 'config1.div13.v_number',
            type: 'number',
            title: 'div1 [number] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_number.title',
            defaultValue: 123,
            value: 123
          },
          {
            id: 'v_int',
            path: 'config1.div13.v_int',
            type: 'int',
            title: 'div1 [int] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_int.title',
            defaultValue: 456,
            value: 456
          },
          {
            id: 'v_float',
            path: 'config1.div13.v_float',
            type: 'float',
            title: 'div1 [float] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_float.title',
            defaultValue: 456.7890123,
            value: 456.7890123
          },
          {
            id: 'v_money',
            path: 'config1.div13.v_money',
            type: 'money',
            title: 'div1 [money] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_money.title',
            defaultValue: 456.7891432,
            value: 456.7891432
          },
          {
            id: 'v_boolean',
            path: 'config1.div13.v_boolean',
            type: 'boolean',
            title: 'div1 [boolean] ORIGINAL TITLE - There are no translations for this title',
            t: 'cs:config1.v_boolean.title',
            defaultValue: true,
            value: true
          }
        ]
      }
    ]
  }
};
