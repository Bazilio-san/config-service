module.exports = {
  root: true,

  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },

  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
    jest: true
  },
  // Rules order is important, please avoid shuffling them
  extends: [
    'plugin:json/recommended',
    'airbnb-base'
  ],
  plugins: [],

  globals: { process: true },

  rules: {
    'no-param-reassign': 'off',
    'space-before-function-paren': ['error', 'always'],
    'no-plusplus': 'off',
    'comma-dangle': ['warn', 'never'],
    'consistent-return': 'off',
    'max-len': ['warn', 200],
    indent: ['error', 2, {
      SwitchCase: 1,
      ignoredNodes: ['TemplateLiteral', 'MemberExpression']
    }],
    'template-curly-spacing': ['off'],
    'no-console': 'warn', // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': 'warn',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'global-require': 'off',
    // 'linebreak-style': 'off',
    'linebreak-style': ['error', 'unix'],
    'object-curly-spacing': ['error', 'always'],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true },
        ObjectPattern: { multiline: true },
        ImportDeclaration: 'never',
        ExportDeclaration: {
          multiline: true,
          minProperties: 3
        }
      }
    ],
    'prefer-destructuring': ['error', {
      object: true,
      array: false
    }],
    'prefer-object-spread': 'error',

    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'prefer-promise-reject-errors': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
