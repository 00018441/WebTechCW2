import { StatusCode } from "#shared/constants/index.js";

export function errorHandler(err, req, res, next) {
    req.logger.error(err.message || "");

    res.status(StatusCode.kServerError).json({
        message: "Internal Server Error",
    });

    next();
}
