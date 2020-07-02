module.exports = [
    {
        id: 'config1',
        title: 'config1 title',
        t: 'cs:config1.title',
        type: 'section',
        value: [
            {
                id: 'div10',
                type: 'string',
                title: 'div10 - This title has a translation',
                t: 'cs:config1.div10.title',
                value: 'DEFAULT string'
            },
            {
                id: 'div11',
                type: 'section',
                title: 'div11 title',
                t: 'cs:config1.div11.title',
                value: [
                    {
                        id: 'div21',
                        type: 'section',
                        title: 'div21 title',
                        value: [
                            {
                                id: 'div31',
                                type: 'section',
                                title: 'div31 title',
                                t: 'cs:config1.div11.div21.div31.title',
                                value: [
                                    {
                                        id: 'div41',
                                        type: 'string',
                                        title: 'div41 title',
                                        t: 'cs:config1.div11.div21.div31.div41.title',
                                        value: 'default string'
                                    }
                                ]
                            }
                        ]
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
                        value: {
                            defaultProp1: { a: 2 },
                            defaultProp2: ['a', 'r', 'r'],
                            defaultProp3: 'sssss',
                            defaultProp4: 555,
                            defaultProp5: true,
                            defaultProp6: null,
                            defaultProp7: undefined
                        }
                    },
                    {
                        id: 'v_array',
                        type: 'array',
                        title: 'div1 [array] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_array.title',
                        value: [111, 222]
                    },
                    {
                        id: 'v_string',
                        type: 'string',
                        title: 'div1 [string] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_string.title',
                        value: 'any string'
                    },
                    {
                        id: 'v_text',
                        type: 'text',
                        title: 'div1 [text] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_text.title',
                        value: `
Много
строчный
текст`
                    },
                    {
                        id: 'v_email',
                        type: 'email',
                        title: 'div1 [email] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_email.title',
                        value: 'default@value.com'
                    },
                    {
                        id: 'v_date',
                        type: 'date',
                        title: 'div1 [date] ORIGINAL TITLE - There are no translations for this title',
                        value: '2020-02-28'
                    },
                    {
                        id: 'v_time',
                        type: 'time',
                        title: 'div1 [time] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_time.title',
                        value: '11:12:13.456'
                    },
                    {
                        id: 'v_datetime',
                        type: 'datetime',
                        title: 'div1 [datetime] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_datetime.title',
                        value: '2020-02-28T11:12:13.456'
                    },
                    {
                        id: 'v_number',
                        type: 'number',
                        title: 'div1 [number] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_number.title',
                        value: 123
                    },
                    {
                        id: 'v_int',
                        type: 'int',
                        title: 'div1 [int] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_int.title',
                        value: 456
                    },
                    {
                        id: 'v_float',
                        type: 'float',
                        title: 'div1 [float] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_float.title',
                        value: 456.7890123
                    },
                    {
                        id: 'v_money',
                        type: 'money',
                        title: 'div1 [money] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_money.title',
                        value: 456.7891432
                    },
                    {
                        id: 'v_boolean',
                        type: 'boolean',
                        title: 'div1 [boolean] ORIGINAL TITLE - There are no translations for this title',
                        t: 'cs:config1.v_boolean.title',
                        value: true
                    },
                ]
            },
        ]
    },
    {
        id: 'config-2',
        title: 'config-2 title',
        t: 'cs:config-2.title',
        type: 'section',
        value: [
            {
                id: 'div21',
                type: 'array',
                title: 'div21 title',
                t: 'cs:config-2.div21.title',
                value: ['default array here', 2, 3, 4]
            },
            {
                id: 'div22',
                type: 'array',
                title: 'div22 title',
                t: 'cs:config-2.div22.title',
                value: [10, 20, 30]
            }
        ]
    },
    {
        id: 'config 3',
        title: 'config 3 title',
        t: 'cs:config3.title',
        type: 'section',
        value: [
            {
                id: 'div31',
                type: 'string',
                title: 'div31 title',
                t: 'cs:config3.div31.title',
                value: 'какая-то строка'
            },
            {
                id: 'div32',
                type: 'string',
                title: 'div32 title',
                t: 'cs:config3.div32.title',
                value: 'какая-то строка'
            }
        ]
    }
];
