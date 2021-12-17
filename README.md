[![NPM Version](http://img.shields.io/npm/v/config-service.svg?style=flat)]()&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/Bazilio-san/config-service.svg?branch=master)](https://travis-ci.org/Bazilio-san/config-service)&nbsp;&nbsp;

Edit the configuration parameters through the API / REST API
===================================

#### Service provides the ability to edit hierarchically organized parameter values for your Node.js application through the API or through the REST API.

#### The structure of the parameters is specified in the Schema file, which can be used to build the parameter editing interface.

Project Guidelines
------------------

* *Simple* - Get started fast
* *Lightweight* - No dependencies
* *Predictable* - Well tested foundation for module and app developers

Features
--------------------

- Editable via API and REST API set of typed parameters
- Unlimited tree structure of parameters
- The Schema is conveniently used to automatically build the parameter editing interface
- Internationalization of Scheme headers
- Function for obtaining a translation file template
- Parameter update event notification
- Ability to add custom parameter types

Quick Start
---------------

**Install in your app directory, and create default directory structure:**

```shell
$ npm install config-srv
$ mkdir config
$ cd config
$ mkdir service
$ cd service
$ mkdir config-data
```

**Create Schema file in the folder `<app_root>/config/service/`:**

```shell
$ vi schema.js
```

```js
module.exports = [
    {
        id: 'namedConfig1',
        title: 'Title of namedConfig1',
        t: 'cs:namedConfig1.title',
        type: 'section',
        value: [
            {
                id: 'div11',
                type: 'section',
                title: 'Title of div11',
                t: 'cs:namedConfig1.div11.title',
                value: [
                    {
                        id: 'div111',
                        type: 'string',
                        title: 'Title of div111',
                        t: 'cs:namedConfig1.div11.div111',
                        arbitraryParameter: 'arbitrary parameter value',
                        value: 'default string'
                    }
                ]
            }
        ]
    },
    {
        id: 'namedConfig2',
        title: 'Title of namedConfig2',
        t: 'cs:namedConfig2.title',
        type: 'section',
        value: [
            {
                id: 'div21',
                type: 'array',
                title: 'div21 title',
                t: 'cs:namedConfig2.div21.title',
                value: [1, 2, 3, 4]
            }
        ]
    },
];
```

**Create named config files in the folder `<app_root>/config/service/config-data`:**

```shell
$ cd config-data
$ vi namedConfig1.json
```

```json
{
    "div11": {
        "div111": "actual string"
    }
}
```

```shell
$ vi namedConfig2.json
```

```json
{
    "div21": [
        5,
        6,
        7
    ]
}
```

**Use it in your code:**

```shell
$ cd ../../../
$ vi example-api.js
```

```js
const configService = require('config-srv')();

// Get the Schema and use it
// to build the client-side parameter editing interface
const schemaOfConfig1 = configService.getSchema('namedConfig1');

// Anywhere in the code,
// get the parameter value by its path:
let value = configService.get('namedConfig1.div11.div111');
console.log(value);
// --> actual string

value = configService.getEx('namedConfig1.div11.div111');
console.log(value);
/*
-->
{
    "value": "actual string",
    "defaultValue": "default string",
    "paramPath": "namedConfig1.div11.div111",
    "paramName": "div111"
}
*/
// Set new parameter value:
configService.set('namedConfig1.div11.div111', 'new value 2');

value = configService.get('namedConfig1.div11.div111');
console.log(value);
// -> new value 2
```

## API / REST API methods

<span style="font-size: 11px;">&lt;ep&gt; - shorthand for "entry point", for
example, <code>http://localhost:8683/config-service</code></span>

<table style="font-size: 13px;">
    <thead>
    <tr>
        <th style="width: 200px">API method</th>
        <th style="width: 400px">Description</th>
        <th style="width: 300px">REST API method</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>
            <b>get</b> (paramPath)
        </td>
        <td>
            Get the value of a configuration parameter along its path. Unlike the getEx method, this function returns
                value as is, without additional information
        </td>
        <td>
            GET &lt;ep&gt;?<b>get</b>[=&lt;paramPath&gt;]
        </td>
    </tr>
    <tr>
        <td>
            <b>getEx</b> (paramPath)
        </td>
        <td>
            Get the value of a configuration parameter along its path<br>
            The parameter value is passed in the property 'paramValue' of the object and is accompanied by additional
                information:<br>
            - defaultValue,<br>
            - isNamedConfig,<br>
            - paramName,<br>
            - paramPath,<br>
        </td>
        <td>
            GET &lt;ep&gt;?<b>get-ex</b>[=&lt;paramPath&gt;]
        </td>
    </tr>
    <tr>
        <td><b>set</b> (paramPath, paramValue)</td>
        <td>Save a parameter value at a given path</td>
        <td>POST &lt;ep&gt;?<b>set</b>=&lt;paramPath&gt;
<pre>{"value": 1234}</pre>
		</td>
    </tr>
    <tr>
        <td><b>getSchema</b> (propPath, lng)</td>
        <td>Returns a Schema for the specified parameter path.<br>
            If the first argument is empty, the entire schema is returned.<br>
            If the second argument (lng) is passed, then the 'title' properties are replaced with localized versions
                in accordance with the value of the 't' parameter (if specified)
        </td>
        <td>GET &lt;ep&gt;?<b>get-schema</b>[=&lt;paramPath&gt;][&amp;&lt;lng&gt;]</td>
    </tr>
    <tr>
        <td><b>list</b> ()</td>
        <td>Returns a list of named configuration IDs</td>
        <td>GET &lt;ep&gt;?<b>list</b></td>
    </tr>
    <tr>
        <td><b>plainParamsList</b> (paramPath, isExtended)</td>
        <td>Returns plain list of parameters, which types is not "section" as Simple or Extended parameter data</td>
        <td>
            GET &lt;ep&gt;?<b>plain-params-list</b>[=&lt;paramPath&gt;]<br>
            GET &lt;ep&gt;?<b>plain-params-list-ex</b>[=&lt;paramPath&gt;]
        </td>
    </tr>
    <tr>
        <td><b>getTranslationTemplate</b> (options)</td>
        <td>Returns a translation template</td>
        <td>&nbsp;</td>
    </tr>
    </tbody>
</table>



## Using REST API

**Integrate the service as middleware in `express`:**

```shell
$ npm install express
$ cd ../../../
$ vi example-rest.js
```

```js
const express = require('express');
const app = require('express')();
const webServer = require('http').Server(app);

app.use(express.json()); // to support JSON-encoded bodies

const { rest } = require('config-srv')();

// Use config-service as middleware
app.use(rest);

app.use((req, res) => {
    // All requests that were not processed by the configuration service will be sent here.
    res.status(501).send('Not Implemented');
});

const port = '8683';
const host = 'localhost';

webServer.listen(port, host, () => {
    console.log(`Web-Server listening on http://${host}:${port}`);
});
```

```shell
$ node example-rest.js
```

**Get full Schema:**

```http request
###
GET http://localhost:8683/config-service?get-schema
```

**Get Schema for the given path:**

```http request
###
GET http://localhost:8683/config-service?get-schema=namedConfig1.div11
```

response:

```json
{
    "id": "div11",
    "type": "section",
    "title": "Title of div11",
    "t": "cs:namedConfig1.div11.title",
    "value": [
        {
            "id": "div111",
            "type": "string",
            "title": "Title of div111",
            "t": "cs:namedConfig1.div11.div111",
            "defaultValue": "default string",
            "arbitraryParameter": "arbitrary parameter value",
            "value": "new value 2",
            "path": "namedConfig1.div11.div111"
        }
    ],
    "path": "namedConfig1.div11"
}
```

**Get a list of named configurations:**

```http request
###
GET http://localhost:8683/config-service?list
```

response:

```json
[
    "namedConfig1",
    "namedConfig2"
]
```

**Get whole parameter structure:**

```http request
###
GET http://localhost:8683/config-service?get
```

response:

```json
{
    "value": {
        "namedConfig1": {
            "div11": {
                "div111": "new value 2"
            }
        },
        "namedConfig2": {
            "div21": [
                5,
                6,
                7
            ]
        }
    }
}
```

**Get parameter value(s) from a given path:**

```http request
###
GET http://localhost:8683/config-service?get=namedConfig1.div11.div111
```

response:

```json
{
    "value": "new value 2"
}
```

**Get parameter value(s) from a given path (accompanied by additional information):**

```http request
###
GET http://localhost:8683/config-service?get-ex=namedConfig1.div11
```

response:

```json
{
    "value": {
        "div111": "new value 2"
    },
    "defaultValue": {
        "div111": "default string"
    },
    "paramPath": "namedConfig1.div11",
    "paramName": "div11"
}
```

**Set parameter value:**

```http request
POST http://localhost:8683/config-service?set=namedConfig1.div13.v_json
Content-Type: application/json

{
    "value": {
        "a": 999,
        "b": "content"
    }
}
```

**Get Help:**

```http request
GET http://localhost:8683/config-service/help
```

> Sample Queries for WebStorm: [example.http](https://github.com/Bazilio-san/config-service/blob/master/example/example.http)




Schema file
---------------------

The `schema.js` file contains information about the structure of parameters, their types and field titles for the
editing interface.

Each parameter is described by an object with the following properties:

<table>
    <thead>
    <tr>
        <th>property</th>
        <th>description</th>
        <th>mandatory</th>
        <th>note</th>
        <th>example</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>id</td>
        <td>ID/property name</td>
        <td>yes</td>
        <td>valid JavaScript variable name</td>
        <td>param1</td>
    </tr>
    <tr>
        <td>type</td>
        <td>Property type</td>
        <td>yes</td>
        <td>property Type</td>
        <td>section</td>
    </tr>
    <tr>
        <td>title</td>
        <td>Property title</td>
        <td>no</td>
        <td>Designed to be used as a field title/label in the editing interface</td>
        <td>Title of property</td>
    </tr>
    <tr>
        <td>t</td>
        <td>Translation ID</td>
        <td>no</td>
        <td>Header translation ID. It is used if the <code>i18next</code> object was transferred during the
            initialization of the service. In this case, the <code>title</code> property will be replaced with
            the corresponding translation.
        </td>
        <td>cs:config1.prop1.title</td>
    </tr>
    <tr>
        <td>value</td>
        <td>Property value</td>
        <td>no</td>
        <td></td>
        <td></td>
    </tr>
    </tbody>
</table>

When a schema is requested via API/REST, the **path** property is automatically added to each schema element. It is the
path to the schema element. It can be used when getting or saving the value of the element.

In addition to these properties, you can set any others and they will be transferred when requesting a schema through
the API. For example, these can be properties for the interface for managing settings, for differentiating rights, etc.

You can specify an additional list of properties that will be translated into other languages when using`i18next`. See
the `translatedProperties` property in the chapter "Options when creating a service" below.



Named configuration files
----------------------------------------

**Separation of a configuration into parts**

There is a need to edit individual groups of settings independently. That is, the interface should have different pages
for different groups of settings. To do this, the parameters are stored in named configurations.

`Named configuration files` are files with the `json` extension and names that exactly match the names of the properties
of the first level of the Schema object.

When a parameter value changes within a single named configuration, the corresponding file is re-saved. Files of other
named configurations are not affected.




Files location
----------------------------

The folder where the service searches for Schema file is by default `<app_root>/config/service/`. The default folder
from which the named configuration files will be read is `<app_root>/config/service/config-data`.

    <app_root>
    .
    └── config
        └── service
            ├── config-data
            │   ├── named_config_1.json
            │   ├── named_config_2.json
            │   └── ...
            └── schema.js

You can specify a different location for `schema.js` through the environment variable.

`NODE_CONFIG_SERVICE_SCHEMA_DIR`

For example:

    NODE_CONFIG_SERVICE_SCHEMA_DIR=./config/my            -> <app_root>/config/my/
    NODE_CONFIG_SERVICE_SCHEMA_DIR=/opt/node/config/my    -> /opt/node/config/my

Different location for named configurations can be changed by setting the value of the environment variable:

`NODE_CONFIG_SERVICE_DIR`

Example 1:

    NODE_CONFIG_SERVICE_SCHEMA_DIR=./my-config-service
    NODE_CONFIG_SERVICE_DIR=named-configs

In this case, the service will work with the following structure:

    .
    └── my-config-service
        ├── named-configs
        │   ├── named_config_1.json
        │   ├── named_config_2.json
        │   └── ...
        └── schema.js
    
    # If you specify the relative path in `NODE_CONFIG_SERVICE_DIR`,
    # then the directory of named configurations will be located relative
    # to the directory where` schema.js` is

Example 2:

    NODE_CONFIG_SERVICE_SCHEMA_DIR=./my-config-service
    NODE_CONFIG_SERVICE_DIR=<abs_app_root_path>/named-configs

In this case, the service will work with the following structure:

    .
    └── my-config-service
    │   └── schema.js
    └── named-configs
        ├── named_config_1.json
        ├── named_config_2.json
        └── ...



Types of Parameters
---------------------

| Standard Schema types | suitable js types | note                    | example                           |
| --------------------- | ----------------- | ----------------------- | --------------------------------- |
| section               | object/array      |                         |                                   |
| array                 | object/array      |                         | [1,2, 'str']                      |
| string                | *                 |                         | 'any string'                      |
| text                  | string            |                         | 'any text'                        |
| date                  | string            | YYYY-MM-DD              | '2020-06-05'                      |
| time                  | string            | HH:mm:ss.SSS            | '14:03:23.478'                    |
| datetime              | string            | YYYY-MM-DDTHH:mm:ss.SSS | '2020-06-05T14:03:23.478'         |
| email                 | string            |                         | 'any.bo-dy@email.do-main.com'     |
| number                | number, string    |                         | 123.456, '123.567'                |
| int                   | number, string    |                         | 12, '13'                          |
| long                  | number, string    |                         | 9223372036854775000, '92233'      |
| float                 | number, string    |                         | 123.456, '123.567'                |
| double                | number, string    |                         | 1234567890.1234567, '123.4567890' |
| money                 | number, string    |                         | 123.456, '123.567'                |
| boolean (bool)        | boolean           |                         | true                              |
| json                  | *                 |                         | { a: 1, b: [1,2,3]}               |

### Custom parameter types

You can add your own parameter types to the Schema.

To do this, pass the `userTypes` property to the service constructor as part of the options object.

An object must contain properties of the same name as user types, each of which contains two properties:

<table>
    <thead>
    <tr>
        <th>property</th>
        <th>type</th>
        <th>default</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>jsTypes</td>
        <td>array</td>
        <td>['any']</td>
        <td>An array of javascript types matching the user type. Used when validating a value.</td>
    </tr>
    <tr>
        <td>validator</td>
        <td>function</td>
        <td>() => {}</td>
        <td>Validation function of the new value. Called before each parameter update. <br />
            Gets three arguments:
            <ul>
                <li><em>newValue</em> {any} - new value</li>
            	<li><em>schemaItem</em> {schemaItemType} - fragment of the schema containing the new value</li>
            	<li><em>error</em> {Object} - container for transmitting validation error message</li>
            </ul>
            The function should return a checked and normalized value or fill in <code>error.reason</code>
        </td>
    </tr>
    </tbody>
</table>


If you fill in the `error.reason` property with an error message, an error of the `ConfigServiceError` type will be
generated. The parameter value will remain the same.

Example:

```js
const userTypes = {
    corpEmail: {
        jsTypes: ['null', 'string'],
        /**
         * Function of validation and normalization of a new value
         *
         * @param {any} newValue - new value
         * @param {schemaItemType} schemaItem - fragment of the schema containing the new value
         * @param {Object} error - container for transmitting validation error message
         * @return {null|any} - normalized value
         */
        validator: (newValue, schemaItem, error = {}) => {
            newValue = String(newValue).trim();
            const match = /^[A-Z._-]+@anycorp.mail.com$/i.exec(newValue);
            if (!match) {
                error.reason = `The email address you provided does not apply to "AnyCorp" corporate addresses.`;
                return null;
            }
            return newValue;
        }
    },
}

const configService = require('config-srv')({ userTypes });
// ...

```



i18n
-----------

In order to get localized field headers in the Schema, when initializing the service, you need to pass the `i18next`
object as part of the options.

### Example

File structure for example:

    <app_root>
    .
    └── config
    │   └── service
    │       ├── config-data
    │       │   └── config1.json
    │       └── schema.js
    └── i18n
    │   ├── en
    │   │   ├── cs.json
    │   │   └── translation.json
    │   ├── ru
    │   │   ├── cs.json
    │   │   └── translation.json
    │   └── index.js
    └── app.js

```shell
$ npm install express
$ npm install i18next i18next-sync-fs-backend
```

File `<app_root>/i18n/index.js`

```js
const backendI18next = require('i18next-sync-fs-backend');

const preload = ['en', 'ru'];

module.exports = () => {
    const i18next = require('i18next');
    i18next
        .use(backendI18next)
        .init({
            load: 'all',
            initImmediate: false,
            saveMissing: true,
            lng: 'en',
            preload,
            fallbackLng: 'en',
            lowerCaseLng: true,
            ns: ['translation', 'cs'],
            defaultNS: 'translation',
            backend: {
                loadPath: `${__dirname}/{lng}/{ns}.json`,
                addPath: `${__dirname}/{ns}.missing.json`,
                jsonIndent: 4
            },
            saveMissingTo: 'all',
            interpolation: {
                prefix: '{',
                suffix: '}'
            }
        }, () => null);

    return i18next;
};
```

File `<app_root>/i18n/en/cs.json`

```json
{
    "__root__title": "TITLE EN for root",
    "config1": {
        "title": "TITLE EN for config1",
        "descr": "DESCRIPTION EN for config1",
        "email": {
            "title": "TITLE EN for config1.email"
        }
    }
}
```

File `<app_root>/i18n/ru/cs.json`

```json
{
    "__root__title": "ЗАГОЛОВОК для root",
    "config1": {
        "title": "ЗАГОЛОВОК для config1",
        "descr": "ОПИСАНИЕ for config1",
        "email": {
            "title": "ЗАГОЛОВОК для config1.email"
        }
    }
}
```

File `<app_root>/config/service/schema.js`

```js
module.exports = [
    {
        id: 'config1',
        title: 'default title',
        t: 'cs:config1.title',
        type: 'section',
        description: 'cs:config1.descr',
        value: [
            {
                id: 'email',
                type: 'email',
                title: 'default title',
                t: 'cs:config1.email.title',
                value: 'default@email.com'
            }
        ]
    }
];
```

File <app_root>/app.js

```js
const serviceOptions = {
    i18n: require('./i18n/index.js')(),
    i18nNS: 'cs',
    translatedProperties: ['description'],
    writeMissingTranslate: true
};

const configService = require('config-srv')(serviceOptions);
const schemaTranslated = configService.getSchema(null, 'ru');

console.log(JSON.stringify(schemaTranslated, undefined, 2));
```

```json
{
    "id": "__root__",
    "type": "section",
    "title": "ЗАГОЛОВОК для root",
    "t": "cs:__root__title",
    "value": [
        {
            "id": "config1",
            "title": "ЗАГОЛОВОК для config1",
            "t": "cs:config1.title",
            "type": "section",
            "description": "ОПИСАНИЕ for config1",
            "value": [
                {
                    "id": "email",
                    "type": "email",
                    "title": "ЗАГОЛОВОК для config1.email",
                    "t": "cs:config1.email.title",
                    "value": "default@email.com",
                    "path": "config1.email"
                }
            ],
            "path": "config1"
        }
    ],
    "path": ""
}
```

### Get translation file template

File <app_root>/app.js (continuation)

```js
const templateOptions = {
    lng: 'en',
    onlyStandardPaths: true,
    /*
    If `onlyStandardPaths = false` - the paths for translation id specified in
    the scheme will be added to the resulting object,
    even if they differ from the standard ones.
    For example:
    for the `config1.div13.v_json = {t: 'cs: config1.vjson.title'}` property,
    the `cs:config1.vjson.title` property will be created.
    If `onlyStandardPaths = true` is specified, only
    then the standard property `config1.div13.v_json.title` will be created.
    */
    addPaths: false
    /*
    If `addPaths = true` - next to the title property is
    placed the `t` property containing the translation id.
    This is convenient to use by immediately copying and
    substituting the translation identifier in the code.
    */
}
const templateEn = configService.getTranslationTemplate(templateOptions);
console.log(JSON.stringify(templateEn, undefined, 4));
```

```json
{
    "__root__title": "TITLE EN for root",
    "config1": {
        "title": "TITLE EN for config1",
        "description": "DESCRIPTION EN for config1",
        "email": {
            "title": "TITLE EN for config1.email"
        }
    }
}
```



Constructor arguments
-------------------------------

<table>
    <thead>
    <tr>
        <th>option</th>
        <th>type</th>
        <th>default</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>i18n</td>
        <td>object</td>
        <td></td>
        <td>i18next instance</td>
    </tr>
    <tr>
        <td>i18nNS</td>
        <td>string</td>
        <td>''</td>
        <td>i18next namespace. Match translation file name. If not specified, the default namespace from i18n settings is used.
        </td>
    </tr>
    <tr>
        <td>writeMissingTranslate</td>
        <td>boolean</td>
        <td>false</td>
        <td>If 'true', then a file of missing translations will be generated</td>
    </tr>
    <tr>
        <td>errorLogger</td>
        <td>object</td>
        <td></td>
        <td>An object that provides the 'error' method, which saves an error message to the log</td>
    </tr>
    <tr>
        <td>jsonStringifySpace</td>
        <td>number</td>
        <td>2</td>
        <td>Number of spaces when formatting JSON of named configuration</td>
    </tr>
    <tr>
        <td>onChange</td>
        <td>function</td>
        <td></td>
        <td>The function that will be called when each property is successfully updated. Signature see below.</td>
    </tr>
    <tr>
        <td>onSaveNamedConfig</td>
        <td>function</td>
        <td></td>
        <td>The function that will be called when the named configuration file is saved, which follows each update made
            in the named configuration parameters.
        </td>
    </tr>
    <tr>
        <td>userTypes</td>
        <td>object</td>
        <td></td>
        <td>In this property, you can pass custom parameter types. See above.</td>
    </tr>
    <tr>
        <td>translatedProperties</td>
        <td>array</td>
        <td></td>
        <td>The list of property names in the schema element, which, in addition to the <code>t</code> property, will be
            translated into other languages when<code>i18next</code> is used. Unlike <code>t</code>, whose value is left
            untouched, the values of properties listed in this array will be replaced with translation.
        </td>
    </tr>
    <tr>
        <td>serviceUrlPath</td>
        <td>string</td>
        <td><nobr>/config-service</nobr></td>
        <td>Path in the URL of REST API</td>
    </tr>
    <tr>
        <td>accessToken</td>
        <td>string</td>
        <td></td>
        <td>Access token</td>
    </tr>
    <tr>
        <td>noThrow</td>
        <td>boolean|object</td>
        <td></td>
        <td>If true = suppresses throwing errors when calling API methods.
If an object is passed, then you can specify separately the methods for which the throwing of errors is suppressed.
<pre lang="javaScript">
{ set: true, get: true }</pre>
</td>
    </tr>
    </tbody>
</table>




Parameter update notifications
-------------------------------

A parent application using the component can receive parameter change notifications generated through the REST API.

For this purpose, callback functions are passed to the service constructor as part of the options object.

<table>
    <thead>
    <tr>
        <th style="width: 300px">Callback function</th>
        <th style="width: 500px">Arguments</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>
            <b>onChange</b> ({<em>paramPath</em>, <em>oldValue</em>, <em>newValue</em>, <em>schemaItem</em>, <em>csInstance</em>, <em>isJustInitialized</em>})
        </td>
        <td>
            <ul>
                <li><em>paramPath</em> {String} - contains the path to the updated parameter</li>
                <li><em>oldValue</em> {any} - old value of updated  parameter</li>
                <li><em>newValue</em> {any} - value of updated  parameter</li>
                <li><em>schemaItem</em> {Object} - reference to a fragment of the schema containing the changed value.
                    It contains additional information that may be useful when processing an event.</li>
                <li><em>csInstance</em> {Schema} - reference to a Schema instance</li>
                <li><em>isJustInitialized</em> {Boolean} - An indication that this is the initialization of the parameter value
                    when creating an instance of the class. When the value is set via <b>set()</b>, this flag will be <b>false</b></li>
                <br>
                You can pass an alternative onChange handler when calling the API of the 'set' method:<br />
                <b>set</b> (<em>&lt;paramPath&gt;, &lt;newValue&gt;, {onChange: &lt;alt_handler&gt;}</em>)<br />
                <br>
                You can also suppress the call of the handler:<br />
                <b>set</b> (<em>&lt;paramPath&gt;, &lt;newValue&gt;, {onChange: <b>false</b>;}</em>)<br />
                <br>
                You can suppress the call of the handler when calling the set REST API method by passing the 'noonchange' parameter:
                <pre><code lang="http request">###
POST http://localhost:8683/config-service?set=param_path&amp;<b>noonchange</b>
Content-Type: application/json
&nbsp;
{ "value": "01:01:01.000" }
</code></pre>
            </ul>
        </td>
    </tr>
    <tr>
        <td>
            <b>onSaveNamedConfig</b> (<em>configName</em>, <em>cs</em>)
        </td>
        <td>
            <ul>
                <li><em>configName</em> {String} - named configuration name. It is the file name.</li>
                <li><em>cs</em> {Schema} - reference to a Schema instance</li>
            </ul>
       </td>
    </tr>
    </tbody>
</table>






