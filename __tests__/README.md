
# Setting up test run in WebStorm

**Run | Edit Configurations |  Add New Configuration | Mocha**

Parameters:

- Name: `TEST JEST`
- Working directory: `<project_root>`
- Environment variables: `NODE_ENV=testing`
- Mocha package: `<project_root>/node_modules/mocha`
- User interface: `bbd`
- Extra Mocha options:

        --file "./test/init.js" 'test/**/**spec.js'

- Tests: mark "File pattern" and leave the field blank

## Running only REST tests

- Extra Mocha options:

        --file "./test/init.js" 'test/REST/**/**spec.js'


