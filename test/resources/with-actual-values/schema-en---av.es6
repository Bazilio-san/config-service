module.exports = {
    id: '__root__',
    type: 'section',
    title: 'ROOT TITLE',
    t: 'cs:__root__title',
    value: [
        {
            id: 'config1',
            title: 'TITLE config1',
            anyOtherProperty: 'any other value',
            descr: 'DESCRIPTION HEADER',
            t: 'cs:config1.title',
            type: 'section',
            value: [
                {
                    id: 'div10',
                    type: 'string',
                    title: 'TITLE config1.div10',
                    t: 'cs:config1.div10.title',
                    defaultValue: 'DEFAULT string',
                    value: 'ACTUAL value'
                },
                {
                    id: 'div11',
                    type: 'section',
                    title: 'TITLE config1.div11',
                    t: 'cs:config1.div11.title',
                    value: [
                        {
                            id: 'div21',
                            type: 'section',
                            title: 'TITLE config1.div11.div21',
                            value: [
                                {
                                    id: 'div31',
                                    type: 'section',
                                    title: 'TITLE config1.div11.div21.div31',
                                    t: 'cs:config1.div11.div21.div31.title',
                                    value: [
                                        {
                                            id: 'div41',
                                            type: 'string',
                                            title: 'TITLE config1.div11.div21.div31.div41',
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
                    type: 'section',
                    title: 'div13 ORIGINAL TITLE - There are no translations for this title',
                    t: 'cs:config1.div13.title',
                    value: [
                        {
                            id: 'v_section_empty',
                            type: 'section',
                            title: 'div1 [section empty] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_section.title',
                            value: []
                        },
                        {
                            id: 'v_json',
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
                            type: 'string',
                            title: 'div1 [string] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_string.title',
                            defaultValue: 'any string',
                            value: 'any string'
                        },
                        {
                            id: 'v_text',
                            type: 'text',
                            title: 'div1 [text] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_text.title',
                            defaultValue: '\nМного\nстрочный\nтекст',
                            value: '\nМного\nстрочный\nтекст'
                        },
                        {
                            id: 'v_email',
                            type: 'email',
                            title: 'div1 [email] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_email.title',
                            defaultValue: 'default@value.com',
                            value: 'default@value.com'
                        },
                        {
                            id: 'v_date',
                            type: 'date',
                            title: 'div1 [date] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.div13.v_date.title',
                            defaultValue: '2020-02-28',
                            value: '2020-02-28'
                        },
                        {
                            id: 'v_time',
                            type: 'time',
                            title: 'div1 [time] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_time.title',
                            defaultValue: '11:12:13.456',
                            value: '11:12:13.456'
                        },
                        {
                            id: 'v_datetime',
                            type: 'datetime',
                            title: 'div1 [datetime] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_datetime.title',
                            defaultValue: '2020-02-28T11:12:13.456',
                            value: '2020-02-28T11:12:13.456'
                        },
                        {
                            id: 'v_number',
                            type: 'number',
                            title: 'div1 [number] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_number.title',
                            defaultValue: 123,
                            value: 123
                        },
                        {
                            id: 'v_int',
                            type: 'int',
                            title: 'div1 [int] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_int.title',
                            defaultValue: 456,
                            value: 456
                        },
                        {
                            id: 'v_float',
                            type: 'float',
                            title: 'div1 [float] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_float.title',
                            defaultValue: 456.7890123,
                            value: 456.7890123
                        },
                        {
                            id: 'v_money',
                            type: 'money',
                            title: 'div1 [money] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_money.title',
                            defaultValue: 456.7891432,
                            value: 456.7891432
                        },
                        {
                            id: 'v_boolean',
                            type: 'boolean',
                            title: 'div1 [boolean] ORIGINAL TITLE - There are no translations for this title',
                            t: 'cs:config1.v_boolean.title',
                            defaultValue: true,
                            value: true
                        }
                    ]
                }
            ]
        },
        {
            id: 'config-2',
            title: 'TITLE config-2',
            t: 'cs:config-2.title',
            type: 'section',
            value: [
                {
                    id: 'div21',
                    type: 'array',
                    title: 'TITLE config-2.div21',
                    t: 'cs:config-2.div21.title',
                    defaultValue: [
                        'default array here',
                        2,
                        3,
                        4
                    ],
                    value: [
                        'ACTUAL array',
                        123
                    ]
                },
                {
                    id: 'div22',
                    type: 'array',
                    title: 'TITLE config-2.div22',
                    t: 'cs:config-2.div22.title',
                    defaultValue: [
                        10,
                        20,
                        30
                    ],
                    value: [
                        10,
                        20,
                        30
                    ]
                },
                {
                    id: 'c0_s0',
                    type: 'string',
                    title: 'There are no values in the scheme and no in the config',
                    t: 'cs:config-2.c0_s0.title',
                    defaultValue: null,
                    value: null
                },
                {
                    id: 'c1_s0',
                    type: 'string',
                    title: 'There are no values in the scheme but in the config',
                    t: 'cs:config-2.c1_s0.title',
                    defaultValue: null,
                    value: 'value is ONLY in the CONFIG'
                }
            ]
        },
        {
            id: 'config 3',
            title: 'TITLE config 3',
            t: 'cs:config3.title',
            type: 'section',
            value: [
                {
                    id: 'div31',
                    type: 'string',
                    title: 'TITLE config 3.div31',
                    t: 'cs:config3.div31.title',
                    defaultValue: 'какая-то строка',
                    value: 'какая-то строка'
                },
                {
                    id: 'div32',
                    type: 'string',
                    title: 'TITLE config 3.div32',
                    t: 'cs:config3.div32.title',
                    defaultValue: 'какая-то строка',
                    value: 'какая-то строка'
                }
            ]
        }
    ]
};
