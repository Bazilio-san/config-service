/* eslint-disable max-len */
function isObject (v) {
    return v != null
        && typeof v === 'object'
        && !Array.isArray(v)
        && !(v instanceof Date)
        && !(v instanceof Set)
        && !(v instanceof Map);
}

function pad (num, numberOfSymbols) {
    const str = `00000${num}`;
    return str.slice(-numberOfSymbols);
}

function isNonEmptyObject (value) {
    if (!isObject(value)) {
        return false;
    }
    return !!Object.keys(value).length;
}

function hasProp (obj, propNAme) {
    return Object.prototype.hasOwnProperty.call(obj, propNAme);
}

const INFINITY = 1 / 0;

function toKey (value) {
    if (typeof value === 'string') {
        return value;
    }
    const result = (`${value}`);
    return (result === '0' && (1 / value) === -INFINITY) ? '-0' : result;
}

function baseGet (object, path) {
    if (!Array.isArray(path)) {
        path = String(path);
        path = path.split('.');
    }
    let index = 0;
    const length = path.length;
    while (object != null && index < length) {
        object = object[toKey(path[index++])];
    }
    return (index && index === length) ? object : undefined;
}

function get (object, path, defaultValue) {
    if (typeof path === 'string') {
        path = path.trim();
        if (!path) {
            return object;
        }
    } else if (Array.isArray(path) && !path.length) {
        return object;
    }
    const result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
}

function each (obj, iteratee) {
    Object.entries(obj).forEach(([key, value]) => {
        iteratee(value, key);
    });
}

function filterObj (obj, thruly) {
    each(obj, (value, key) => {
        if (!thruly(value, key)) {
            delete obj[key];
        }
    });
}

function cloneDeep (obj, options = {}) {
    if (!options.removeProps) {
        options.removeProps = []; // Array of property names to be removed
    }
    if (options.pureObj === undefined) {
        options.pureObj = false; // If true, cloned objects will not contain a constructor
    }
    if (options.removeSymbols === undefined) {
        options.removeSymbols = false; // If true, cloned objects will not contain Symbol properties
    }
    if (!options.hash) {
        options.hash = new WeakMap(); // If true, cloned objects will not contain a constructor
    }
    const { removeProps, pureObj, removeSymbols, hash } = options;

    // https://stackoverflow.com/a/40294058/5239731
    if (Object(obj) !== obj) return obj; // primitives
    if (hash.has(obj)) return hash.get(obj); // cyclic reference
    let result;
    if (obj instanceof Set) {
        result = new Set(obj); // See note about this!
    } else if (obj instanceof Map) {
        result = new Map(Array.from(obj, ([key, val]) => [key, cloneDeep(val, options)]));
    } else if (obj instanceof Date) {
        result = new Date(obj);
    } else if (obj instanceof RegExp) {
        result = new RegExp(obj.source, obj.flags);
    } else if (obj instanceof Function) {
        result = obj;
    } else if (obj.constructor) {
        // If there is a constructor. Except when pureObj === true and it is a real {}-object
        if (pureObj) {
            if (obj.constructor === Object) {
                result = Object.create(null);
            } else {
                result = new obj.constructor();
            }
        } else {
            result = new obj.constructor();
        }
    } else {
        result = Object.create(null);
    }
    hash.set(obj, result);

    const keys = (removeSymbols ? Object.keys(obj) : [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)])
        .filter((propName) => !removeProps.includes(propName));
    return Object.assign(result, ...keys.map(
        (key) => ({ [key]: cloneDeep(obj[key], options) })
    ));
}

function canDeepDive (v) {
    return typeof v === 'object' && v !== null && Object.keys(v).length > 0;
}

function cloneDeepWithoutUndefined (obj) {
    if (isObject(obj)) {
        const keys = [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
        const entries = keys.map((key) => [key, obj[key]]);
        return entries.filter(([, v]) => v !== undefined).reduce((r, [k, v]) => {
            r[k] = canDeepDive(obj) ? cloneDeepWithoutUndefined(v) : v;
            return r;
        }, {});
    }
    if (Array.isArray(obj)) {
        return obj.filter((v) => v !== undefined).reduce((r, v) => {
            r.push(canDeepDive(obj) ? cloneDeepWithoutUndefined(v) : v);
            return r;
        }, []);
    }
    return obj;
}

/**
 * Checks if the passed object is a Schema
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isSchemaItem (obj) {
    return isNonEmptyObject(obj)
        && hasProp(obj, 'id')
        && hasProp(obj, 'type')
        && (
            hasProp(obj, 'value')
            || hasProp(obj, 't')
            || hasProp(obj, 'title')
        );
}

function defineFinalHiddenProperty (obj, propertyName, value) {
    Object.defineProperty(obj, propertyName, {
        value,
        writable: false,
        configurable: false,
        enumerable: false
    });
}

module.exports = {
    cloneDeepWithoutUndefined,
    isObject,
    getCmdOrEnv (paramName, defaultValue) {
        const cmdLineArgs = process.argv.slice(2, process.argv.length);
        const argName = `--${paramName}=`;
        const cmdLineArgValue = (cmdLineArgs.find((el) => el.startsWith(argName)) || '').substr(argName.length);
        return cmdLineArgValue || process.env[paramName] || defaultValue;
    },
    parseAndValidateDate (str, reasonContainer = {}) {
        if (typeof str !== 'string') {
            reasonContainer.reason = `A string representation of the date is expected ( pattern "YYYY-MM-DD[THH:mm:ss[.SSS]]" ). Received type: ${typeof str}`;
            return null;
        }
        const reDateTime = /^(\d{4})-([01]\d)-([0-3]\d)(?:[ T]([0-2]\d?):([0-5]\d?):([0-5]\d?)(?:\.(\d{3}))?)?$/;
        let match = reDateTime.exec(str);
        if (!match) {
            reasonContainer.reason = `The string representation of the date does not match the pattern "YYYY-MM-DD[THH:mm:ss[.SSS]]": "${str}"`;
            return null;
        }
        match = [...match];
        match.shift();
        const [YYYY, MM, DD, HH = 0, mm = 0, ss = 0, SSS = 0] = match.map((v) => Number(v) || 0);

        const d = new Date(YYYY, MM - 1, DD, HH, mm, ss, SSS);
        const dNum = d.getTime();
        if (!dNum && dNum !== 0) { // NaN value, Invalid date
            reasonContainer.reason = `String representation of date cannot be converted to date: "${str}". Expected format is YYYY-MM-DDTHH.mm.ss.SSS or YYYY-MM-DD or HH.mm.ss.SSS or HH.mm.ss`;
            return null;
        }
        if (d.getMonth() !== MM - 1 || d.getDate() !== DD
            || d.getHours() !== HH || d.getMinutes() !== mm || d.getSeconds() !== ss
            || d.getMilliseconds() !== SSS) {
            reasonContainer.reason = `String representation of date is invalid: "${str}"`;
            return null;
        }
        return `${YYYY}-${pad(MM, 2)}-${pad(DD, 2)}T${pad(HH, 2)}:${pad(mm, 2)}:${pad(ss, 2)}.${(`${SSS}000`).substr(0, 3)}`;
    },
    isNonEmptyObject,
    hasProp,
    each,
    filterObj,
    get,
    cloneDeep,
    isSchemaItem,
    canDeepDive,
    defineFinalHiddenProperty
};
