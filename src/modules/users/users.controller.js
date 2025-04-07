import Router from "express-promise-router";
import { usersMinions } from "./minions/users-minions.js";
import { getUserFromToken } from "#shared/middlewares/index.js";
import { parameterize } from "#shared/utils/index.js";
import { ErrorCode } from "./users.constants.js";
import { UsersService } from "./users.service.js";
import { StatusCode, Endpoint } from "#shared/constants/index.js";

export const UsersController = Router();

UsersController.get(Endpoint.Api.kProfile, getUserFromToken, async function (req, res) {
    try {
        const user = await UsersService.getUserById(res.locals.userId);
        req.logger.info(`fetched user ${res.locals.userId}: ${JSON.stringify(user)}`);

        let response = parameterize(usersMinions.kNavUsername, { username: user.username });
        if (isAdmin(user)) {
            response += usersMinions.kAdminUsersPageLink;
        }

        res.status(StatusCode.kOk).send(response);
    } catch (err) {
        if (err.message === ErrorCode.kInvalidId) {
            req.logger.info(`invalid user id, sending guest`);
            res.status(StatusCode.kOk).send(parameterize(usersMinions.kNavUsername, { username: "Guest" }));
        } else {
            throw err;
        }
    }
});

function isAdmin(user) {
    return user.role === "admin";
}
