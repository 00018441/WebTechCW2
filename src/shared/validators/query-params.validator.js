import { sharedMinions } from "#shared/minions/shared-minions.js";
import { parameterize } from "#shared/utils/index.js";
import { ZodError } from "zod";

export function validateQueryParams(schema) {
    return (req, _res, next) => {
        try {
            req.query = schema.parse(req.query);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = `❌ ${error.errors[0].message}.`;
                const validationErrorMessage = `Please fix the following: ${errorMessages}`;
                req.errorMessages = [parameterize(sharedMinions.kErrorMessage, { message: validationErrorMessage })];

                next();
            } else {
                next(error);
            }
        }
    };
}
