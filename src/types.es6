/* eslint-disable max-len,no-bitwise */

/*
Standard data types for parameters

Each data type has a javascript data type correspondence map and the function
of normalizing/checking the value of this type - "validator".

 */

const __ = require('./lib.es6');

module.exports = {
    json: {
        jsTypes: ['null', 'object', 'array', 'string', 'number', 'boolean'],
        /**
         * Function of validation and normalization of a new value
         *
         * @param {any} newVal - new meaning
         * @param {schemaItemType} schemaItem - fragment of the schema containing the new value
         * @param {Object} error - container for sending validation error messages
         * @return {null|any} - normalized value
         */
        validator: (newVal, schemaItem, error = {}) => {
            if (!newVal) {
                return newVal;
            }
            try {
                return JSON.parse(JSON.stringify(newVal));
            } catch (err) {
                error.reason = `Failed to normalize JSON value Error: ${err.message}`;
                return null;
            }
        }
    },
    section: {
        jsTypes: ['null', 'array', 'object'],
        validator: (newVal, schemaItem, error = {}) => {
            error.reason = `Cannot set a value for a 'section'. Path «${schemaItem.path}». Value: «${newVal}»`;
            return undefined;
        }
    },
    array: {
        jsTypes: ['null', 'array'],
        validator: (newVal, schemaItem, error = {}) => {
            if (Array.isArray(newVal)) {
                return newVal;
            }
            error.reason = `Type mismatch.  «Array» expected, received: «${typeof newVal}»`;
            return null;
        }
    },
    string: {
        jsTypes: ['any'],
        validator: (newVal) => (typeof newVal === 'string' ? newVal : JSON.stringify(newVal))
    },
    text: {
        jsTypes: ['null', 'string'],
        validator: (newVal) => (typeof newVal === 'string' ? newVal : JSON.stringify(newVal))
    },
    date: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const dt = __.parseAndValidateDate(newVal, error);
            return dt ? dt.substr(0, 10) : null;
        }
    },
    time: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const dt = __.parseAndValidateDate(`2000-01-01T${String(newVal)}`, error);
            return dt ? dt.substr(11) : null;
        }
    },
    datetime: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => __.parseAndValidateDate(newVal, error)
    },
    email: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const rT = typeof newVal;
            if (rT !== 'string') {
                error.reason = `A string representation of the email is expected. Received type: «${rT}»`;
                return null;
            }
            newVal = newVal.trim();
            const match = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.exec(newVal);
            if (!match) {
                error.reason = `The string representation of the email does not match the pattern`;
                return null;
            }
            return newVal;
        }
    },
    number: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const rT = typeof newVal;
            if (rT === 'number') {
                return Number.isNaN(newVal) ? null : newVal;
            }
            if (rT === 'string' && newVal) {
                const val = Number(newVal);
                if (Number.isNaN(val)) {
                    error.reason = `Failed to convert string to number: «${newVal}»`;
                    return null;
                }
                return val;
            }
            error.reason = `The expected type is  «number» or a string that can be converted to a number. Received type: «${rT}»`;
            return null;
        }
    },
    int: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const rT = typeof newVal;
            if (rT === 'number') {
                return Number.isNaN(newVal) ? null : ~~newVal;
            }
            if (rT === 'string' && newVal) {
                const val = Number(newVal);
                if (Number.isNaN(val)) {
                    error.reason = `Failed to convert string to number: «${newVal}»`;
                    return null;
                }
                return ~~val;
            }
            error.reason = `The expected type is  «number» or a string that can be converted to a number. Received type: «${rT}»`;
            return null;
        }
    },
    float: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const rT = typeof newVal;
            if (rT === 'number') {
                return Number.isNaN(newVal) ? null : newVal;
            }
            if (rT === 'string' && newVal) {
                const val = parseFloat(newVal);
                if (Number.isNaN(val)) {
                    error.reason = `Failed to convert string to number: «${newVal}»`;
                    return null;
                }
                return val;
            }
            error.reason = `The expected type is  «number» or a string that can be converted to a number. Received type: «${rT}»`;
            return null;
        }
    },
    money: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const rT = typeof newVal;
            if (rT === 'number') {
                return Number.isNaN(newVal) ? null : newVal;
            }
            if (rT === 'string' && newVal) {
                const val = parseFloat(newVal);
                if (Number.isNaN(val)) {
                    error.reason = `Failed to convert string to number: «${newVal}»`;
                    return null;
                }
                return val;
            }
            error.reason = `The expected type is  «number» or a string that can be converted to a number. Received type: «${rT}»`;
            return null;
        }
    },
    boolean: {
        jsTypes: ['null', 'boolean'],
        validator: (newVal, schemaItem, error = {}) => {
            const rT = typeof newVal;
            if (rT === 'boolean') {
                return newVal;
            }
            if (rT === 'string') {
                const val = newVal.toLowerCase();
                if (val === 'true') {
                    return true;
                }
                if (val === 'false') {
                    return false;
                }
                error.reason = `Expected string representation of  «true» |  «false». Received: «${newVal}»`;
                return null;
            }
            if (rT === 'number') {
                if (Math.abs(newVal) === 1) {
                    return true;
                }
                if (newVal === 0) {
                    return false;
                }
                error.reason = `A numeric representation of -1|1|0 is expected. Received: ${newVal}`;
                return null;
            }
            error.reason = `The expected type is  «boolean» or  «number» (-1|1|0) or a string ( «true»| «false»). Received type: «${rT}»`;
            return null;
        }
    }
};
