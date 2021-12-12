const REST = require('./REST.es6');

const configServiceIO = (options, configService) => {
    const { socket, debugNPM, prefix } = options;
    const debugSocket = typeof debugNPM === 'function'
        ? debugNPM('config-service:socket')
        : () => {};

    if (typeof socket.applyFn !== 'function') {
        socket.getCallback = (args) => {
            if (!args) {
                return;
            }
            if (typeof args === 'function') {
                return args;
            }
            if (Array.isArray(args)) {
                return args.find((v) => typeof v === 'function');
            }
        };

        socket.callBack = (fn, args2) => {
            if (!Array.isArray(args2)) {
                args2 = [args2];
            }
            return fn.apply(socket, args2);
        };

        socket.applyFn = (args, args2) => {
            const fn = socket.getCallback(args);
            if (fn) {
                return socket.callBack(fn, args2);
            }
        };
    }

    socket.on(`${prefix}/get-schema`, async (request = {}, ...args) => {
        const lng = (request.lng || '').substr(0, 2).toLowerCase();
        debugSocket(`GET SCHEMA: lng = ${lng}`);
        const schema = configService.getSchema(request.propPath, lng);
        socket.applyFn(args, schema);
    });

    socket.on(`${prefix}/get-ex`, async (request, ...args) => {
        const { propPath } = request;
        debugSocket(`GET EX: propPath = ${propPath}`);
        const data = configService.getEx(propPath);
        socket.applyFn(args, data);
    });

    socket.on(`${prefix}/get`, async (request, ...args) => {
        const { propPath } = request;
        debugSocket(`GET: propPath = ${propPath}`);
        const data = configService.get(propPath);
        socket.applyFn(args, data);
    });

    socket.on(`${prefix}/set`, async (request, ...args) => {
        const { propPath, paramValue } = request;
        debugSocket(`SET: ${propPath} = ${JSON.stringify(paramValue)}`);
        const isSet = configService.set(propPath, paramValue);
        socket.applyFn(args, isSet);
    });

    socket.on(`${prefix}/params-list`, async ({ node, isExtended = false }, ...args) => {
        const paramList = configService.plainParamsList(node, { isExtended });
        debugSocket(`GET: plainParamsList / node = ${node}`);
        socket.applyFn(args, [paramList]);
    });
};

module.exports = class IO extends REST {
    constructor (serviceOptions = {}) {
        super(serviceOptions);
        const { socketOptions } = serviceOptions;
        let { prefix } = socketOptions;
        prefix = prefix || 'cs';
        socketOptions.prefix = prefix;
        const { debugNPM, broadcast: { io, throttleTimeoutMills } } = socketOptions;

        this.socketOptionsPrefix = prefix; // Information parameter
        configServiceIO(socketOptions, this);
        if (io) {
            const debugIO = typeof debugNPM === 'function'
                ? debugNPM('config-service:io')
                : () => {};
            const emitId = `broadcast/${prefix}/param-changed`;
            let broadcast = (data) => {
                const [path, value, schemaItem, , isJustInitialized] = data;
                debugIO(`[${emitId}]: path: ${path}, value: ${value}`);
                io.emit(emitId, { path, value, schemaItem, isJustInitialized });
            };
            if (throttleTimeoutMills) {
                broadcast = this.throttle(broadcast, throttleTimeoutMills);
            }
            this.onChange = (...args) => {
                broadcast(args);
                if (typeof this.onChange === 'function') {
                    return this.onChange(args);
                }
            };
        }
    }
};
