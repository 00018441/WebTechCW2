import { UsersService } from "#modules/users/users.service.js";
import { StatusCode, ErrorCode } from "#shared/constants/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { parameterize } from "#shared/utils/index.js";

export function authorizeAccess(...roles) {
    return async function (_req, res, next) {
        try {
            res.locals.user = await UsersService.getUserById(res.locals.userId);

            if (roles.includes("admin") && res.locals.user?.role == "admin") {
                next();
            } else {
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, { message: "You are not allowed to view this resource" }),
                );
            }
        } catch (err) {
            if (err.message === ErrorCode.kUserInvalidId) {
                res.status(StatusCode.kOk).send(parameterize(sharedMinions.kErrorMessage, { message: "Not Found" }));
            }

            next(err);
        }
    };
}
