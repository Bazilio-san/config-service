module.exports = [
  {
    id: 'rules1',
    title: 'rules1 title',
    t: 'config.rules1',
    type: 'section',
    value: [
      {
        id: 'DIV1',
        title: 'DIV1 title',
        t: 'config.rules1.DIV1',
        type: 'int',
        value: 2
      }
    ]
  },
  {
    id: 'rules',
    title: 'rules rules',
    t: 'config.rules',
    type: 'section',
    value: [
      {
        id: 'DIV1',
        type: 'badtype',
        title: 'DIV2 title',
        t: 'config.rules.DIV2',
        value: 333
      }
    ]
  }
];
