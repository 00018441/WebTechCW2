import { AsyncLocalStorage } from "node:async_hooks";
import { v4 as uuid } from "uuid";

const asyncLocalStorage = new AsyncLocalStorage();

function requestContextMiddleware(req, _res, next) {
    const context = {
        requestId: uuid(),
        method: req.method,
        endpoint: req.originalUrl,
    };

    asyncLocalStorage.run(context, () => {
        req.requestId = context.requestId;
        next();
    });
}

function getContext() {
    return asyncLocalStorage.getStore() || {};
}

export { getContext, requestContextMiddleware };
