import { StatusCode } from "#shared/constants/index.js";
import { log } from "./logger.middleware.js";

export function errorHandler(err, _req, res, next) {
    log("ERROR", `${err.name} - ${err.message}` || "uncaught error");
    res.status(StatusCode.kOk).send(`<p id="error-message">Something went wrong</p>`);

    next();
}
