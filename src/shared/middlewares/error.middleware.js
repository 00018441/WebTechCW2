import { StatusCode } from "#shared/constants/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { parameterize } from "#shared/utils/parameterize-ejs.util.js";
import { log } from "./logger.middleware.js";

export function errorHandler(err, _req, res, next) {
    log("ERROR", `${err.name} - ${err.message}` || "uncaught error");
    res.status(StatusCode.kOk).send(parameterize(sharedMinions.kErrorMessage, { message: "Something went wrong" }));

    next();
}
