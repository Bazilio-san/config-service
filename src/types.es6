/* eslint-disable max-len,no-bitwise */

/*
Standard data types for parameters

Each data type has a javascript data type correspondence map and the function
of normalizing/checking the value of this type - "validator".

 */

const __ = require('./lib.es6');

const MIN_INT = -2147483648;
const MAX_INT = 2147483647;
const MIN_LONG = -9223372036854775808;
const MAX_LONG = 9223372036854775807;

function numberValidator (newVal, schemaItem, error = {}, isFractional = false) {
    if (newVal == null) {
        return null;
    }
    const rT = typeof newVal;
    let val = newVal;
    if (rT === 'number') {
        if (Number.isNaN(newVal)) {
            return null;
        }
    } else if (rT === 'string' && newVal) {
        val = isFractional ? parseFloat(newVal) : Number(newVal);
        if (Number.isNaN(val)) {
            error.reason = `Failed to convert string to number: «${newVal}»`;
            return null;
        }
    } else {
        error.reason = `The expected js type is «number» or a string that can be converted to a number. Received type: «${rT}»`;
        return null;
    }
    if (val > Number.MAX_VALUE) {
        error.reason = `Number value is very big: «${val}»`;
        return null;
    }
    if (!isFractional) {
        val = Math.round(Math.max(Math.min(val, MAX_LONG), MIN_LONG));
    } else {
        const { precision, type } = schemaItem;
        if (type === 'float') {
            val = Math.fround(val);
            if (`${val}`.startsWith(`${newVal}`)) {
                val = typeof newVal === 'string' ? parseFloat(newVal) : newVal;
            }
        }
        if (precision != null) {
            val = Number(val.toFixed(precision));
        }
    }
    return val === 0 ? 0 : val;
}

function booleanValidator (newVal, schemaItem, error = {}) {
    if (newVal == null) {
        return null;
    }
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
        error.reason = `Expected string representation of «true» |  «false». Received: «${newVal}»`;
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
    error.reason = `The expected type is «boolean» or «number» (-1|1|0) or a string ( «true»| «false»). Received type: «${rT}»`;
    return null;
}

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
                if (typeof newVal === 'string') {
                    if (/^\s*\[.*]\s*$|^\s*{.*}\s*$/i.test(newVal)) {
                        try {
                            return JSON.parse(newVal);
                        } catch (err) {
                            return JSON.parse(newVal.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '));
                        }
                    }
                    return newVal;
                }
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
            if (newVal == null) {
                return null;
            }
            if (Array.isArray(newVal)) {
                return newVal;
            }
            error.reason = `Type mismatch.  «Array» expected, received: «${typeof newVal}»`;
            return null;
        }
    },
    string: {
        jsTypes: ['any'],
        validator: (newVal) => {
            if (newVal == null) {
                return null;
            }
            return (typeof newVal === 'string' ? newVal : JSON.stringify(newVal));
        }
    },
    text: {
        jsTypes: ['null', 'string'],
        validator: (newVal) => {
            if (newVal == null) {
                return null;
            }
            return (typeof newVal === 'string' ? newVal : JSON.stringify(newVal));
        }
    },
    date: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            if (newVal == null) {
                return null;
            }
            const dt = __.parseAndValidateDate(newVal, error);
            return dt ? dt.substr(0, 10) : null;
        }
    },
    time: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            if (newVal == null) {
                return null;
            }
            const dt = __.parseAndValidateDate(`2000-01-01T${String(newVal)}`, error);
            return dt ? dt.substr(11) : null;
        }
    },
    datetime: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            if (newVal == null) {
                return null;
            }
            return __.parseAndValidateDate(newVal, error);
        }
    },
    email: {
        jsTypes: ['null', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            if (newVal == null) {
                return null;
            }
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
        validator: (newVal, schemaItem, error = {}) => numberValidator(newVal, schemaItem, error, true)
    },
    int: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const validated = numberValidator(newVal, schemaItem, error);
            if (validated == null) {
                return null;
            }
            return Math.round(Math.max(Math.min(validated, MAX_INT), MIN_INT));
        }
    },
    long: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const validated = numberValidator(newVal, schemaItem, error);
            return validated == null ? null : validated;
        }
    },
    float: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const validated = numberValidator(newVal, schemaItem, error, true);
            if (validated == null) {
                return null;
            }
            return validated;
        }
    },
    double: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => {
            const validated = numberValidator(newVal, schemaItem, error, true);
            return validated;
        }
    },
    money: {
        jsTypes: ['null', 'number', 'string'],
        validator: (newVal, schemaItem, error = {}) => numberValidator(newVal, schemaItem, error, true)
    },
    boolean: {
        jsTypes: ['null', 'boolean'],
        validator: (newVal, schemaItem, error = {}) => booleanValidator(newVal, schemaItem, error)
    },
    bool: {
        jsTypes: ['null', 'boolean'],
        validator: (newVal, schemaItem, error = {}) => booleanValidator(newVal, schemaItem, error)
    }
};
