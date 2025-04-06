import { getContext } from "./request-context.middleware.js";

function responseHeaderMiddleware(req, res, next) {
    const start = process.hrtime.bigint();

    const originalSend = res.send;
    res.send = function (body) {
        const durationMs = (Number(process.hrtime.bigint() - start) / 1_000_000).toFixed(2);

        const context = getContext();
        if (context?.requestId) {
            res.setHeader("X-RequestId", context.requestId);
        }

        req.logger.info(`finished handling in ${durationMs}ms`);
        return originalSend.call(this, body);
    };

    next();
}

export { responseHeaderMiddleware };
