import { StatusCode } from "#shared/constants/index.js";
import { log } from "./logger.middleware.js";

export function errorHandler(err, req, res, next) {
    log("ERROR", `${err.name} - ${err.message}` || "unknown error");
    res.status(StatusCode.kServerError).send("<h1>Something went wrong</h1>");

    next();
}
