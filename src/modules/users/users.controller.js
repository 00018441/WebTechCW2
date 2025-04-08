import { format } from "timeago.js";
import Router from "express-promise-router";
import { UsersService } from "./users.service.js";
import { usersMinions } from "./minions/users-minions.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { validateQueryParams } from "#shared/validators/index.js";
import { usersParamsSchema } from "./schemas/users-params.schema.js";
import { getUserFromToken, authorizeAccess } from "#shared/middlewares/index.js";
import { StatusCode, Endpoint, ErrorCode, Role } from "#shared/constants/index.js";
import { parameterize, isEmpty, isUserAdmin, isRepeatedRequest } from "#shared/utils/index.js";

export const UsersController = Router();

UsersController.get(Endpoint.Api.kProfile, getUserFromToken, async function (req, res) {
    try {
        const user = await UsersService.getUserById(res.locals.userId);
        req.logger.info(`fetched user ${res.locals.userId}: ${JSON.stringify(user)}`);

        let response = parameterize(usersMinions.kNavUsername, {
            publicUserInfoUrl: `${Endpoint.Api.kUserGet}/${user.id}`,
            username: user.username,
        });
        if (isUserAdmin(user)) {
            response += parameterize(usersMinions.kAdminUsersPageLink, { usersListUrl: Endpoint.Pages.kUsers });
        }

        res.status(StatusCode.kOk).send(response);
    } catch (err) {
        if (err.message === ErrorCode.kUserInvalidId) {
            req.logger.info(`invalid user id, sending guest`);
            res.status(StatusCode.kOk).send(parameterize(usersMinions.kNavUsername, { username: "Guest" }));
        } else {
            throw err;
        }
    }
});

UsersController.get(`${Endpoint.Api.kUserGet}/:userId`, async function (req, res) {
    try {
        const { userId } = req.params;

        req.logger.info(`received user id ${userId}`);
        const user = await UsersService.getPublicUserInfo(userId);

        res.status(StatusCode.kOk).send(
            parameterize(usersMinions.kUserInfoTooltip, {
                username: user.username,
                status: user.status,
                registeredAgo: format(new Date(user["created_at"]), "en_US"),
            }),
        );
    } catch (err) {
        if (err.message === ErrorCode.kUserInvalidId) {
            req.logger.info(`failed to fetch public user info due to invalid id`);
            res.status(StatusCode.kOk).send(parameterize(sharedMinions.kErrorMessage, { message: "Invalid user Id" }));
        } else {
            throw err;
        }
    }
});

UsersController.get(
    Endpoint.Pages.kUsers,
    getUserFromToken,
    authorizeAccess(Role.kAdmin),
    validateQueryParams(usersParamsSchema),
    async function (req, res) {
        try {
            const { page = 0, limit = 15, username = "" } = req.query;
            req.logger.info(`fetching users: page=${page}, limit=${limit}, username=${username}`);

            const users = await UsersService.getUsers(page, limit, username);
            const cards = users
                .map((user) => {
                    return parameterize(usersMinions.kUserCard, {
                        username: parameterize(usersMinions.kUsernameWithTooltip, {
                            username: user.username,
                            publicUserInfoUrl: `${Endpoint.Api.kUserGet}/${user.id}`,
                        }),
                        email: user.email,
                        userRole: user.role,
                        userStatus: user.status,
                        postsCount: user["posts_count"],
                        userDeleteUrl: `${Endpoint.Api.kUserDelete}/${user.id}`,
                    });
                })
                .join("");

            // emit an event if no posts left so
            // frontend can hide the load more button
            const loadMoreButton =
                users.length === limit
                    ? parameterize(usersMinions.kLoadMoreButton, {
                          usersListUrl: Endpoint.Pages.kUsers,
                          page: page + 1,
                          limit,
                          username,
                      })
                    : (() => (res.setHeader("HX-Trigger", "no-more-users"), ""))();

            let response = parameterize(usersMinions.kUsersPage, {
                userCards: cards,
                usersListUrl: Endpoint.Pages.kUsers,
            });

            let errorMessage = "";
            req.errorMessages ??= [];
            if (!isEmpty(req.errorMessages)) {
                errorMessage = req.errorMessages.at(0);
                req.errorMessages.shift();
            }

            if (isRepeatedRequest(page)) {
                return res.status(StatusCode.kOk).send(cards + loadMoreButton + errorMessage);
            }

            res.status(StatusCode.kOk).send(response + loadMoreButton + errorMessage);
        } catch (err) {
            throw err;
        }
    },
);

UsersController.delete(
    `${Endpoint.Api.kUserDelete}/:userId`,
    getUserFromToken,
    authorizeAccess(Role.kAdmin),
    async function (req, res) {
        try {
            const { userId } = req.params;
            await UsersService.deleteUser(userId);
            req.logger.info(`deleted user ${userId}`);

            res.status(StatusCode.kOk).send();
        } catch (err) {
            if (err.message === ErrorCode.kUserInvalidId) {
                req.logger.info(`failed to delete user, invalid id`);
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, { message: "Invalid user Id" }),
                );
            } else {
                throw err;
            }
        }
    },
);
