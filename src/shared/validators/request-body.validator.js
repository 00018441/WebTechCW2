import { StatusCode } from "#shared/constants/index.js";
import { ZodError } from "zod";

export function validateRequestBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = `❌ ${error.errors[0].message}.`;
                const validationErrorMessage = `Please fix the following: ${errorMessages}`;

                res.status(StatusCode.kOk).send(`<p id="error-message">${validationErrorMessage}</p>`);
            } else {
                next(error);
            }
        }
    };
}
