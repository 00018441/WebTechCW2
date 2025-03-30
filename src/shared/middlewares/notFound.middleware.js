import { StatusCode } from "#shared/constants/index.js";

export function notFoundHandler(req, res) {
    req.logger.warn("not found");

    res.status(StatusCode.kNotFound).json({
        message: "Not Found",
    });
}
