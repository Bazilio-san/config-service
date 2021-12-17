# Config Service Help

## Help request

    /config-service/help

## Schema request

Full Schema:

    /config-service?get-schema

Schema for the given path:

    /config-service?get-schema=config1.div1.div2.param1

When requesting a Schema of a non-existent path, error 500 is returned:

    /config-service?get-schema=no-such-div

## Request a list of named configurations

    /config-service?list

## Request for parameter values

Whole parameter structure

    /config-service?get

Parameters for a given path

    /config-service?get=config1.div13.v_json

## Setting parameter values

    POST /config-service?set=config1.div13.v_json
    Content-Type: application/json

    {
        "value": {
            "a": 999,
            "b": "content"
        }
    }
