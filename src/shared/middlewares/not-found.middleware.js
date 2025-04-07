import { StatusCode } from "#shared/constants/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { parameterize } from "#shared/utils/index.js";

export function notFoundHandler(req, res) {
    req.logger.warn("route not found");

    res.status(StatusCode.kNotFound).send(parameterize(sharedMinions.kErrorMessage, { message: "Not Found" }));
}
