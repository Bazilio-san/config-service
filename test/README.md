
# Setting up test run in WebStorm

**Run | Edit Configurations |  Add New Configuration | Mocha**

Parameters:

- Name: `TEST MOCHA`
- Working directory: `<project_root>`
- Environment variables: `NODE_ENV=testing`
- Mocha package: `<project_root>/node_modules/mocha`
- User interface: `bbd`
- Extra Mocha options:

        --file "./test/init.es6" 'test/**/**spec.es6'

- Tests: mark "File pattern" and leave the field blank

## Running only REST tests

- Extra Mocha options:

        --file "./test/init.es6" 'test/REST/**/**spec.es6'


