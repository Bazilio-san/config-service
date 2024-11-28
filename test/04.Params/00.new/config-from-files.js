module.exports = {
  config1: {
    div10: 'ACTUAL value',
    div11: { div21: { div31: { div41: 'ACTUAL string' } } },
    no_in_schema: 'This value is not in the schema',
  },
  'config-2': {
    div21: [
      'ACTUAL array',
      123,
    ],
    c1_s0: 'value is ONLY in the CONFIG',
  },
  'config 3': null,
};
