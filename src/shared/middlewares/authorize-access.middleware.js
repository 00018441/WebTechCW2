import { PostsService } from "#modules/posts/posts.service.js";
import { UsersService } from "#modules/users/users.service.js";
import { StatusCode, ErrorCode, Role, Constants } from "#shared/constants/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { isUserAdmin, parameterize } from "#shared/utils/index.js";

export function authorizeAccess(...roles) {
    return async function (req, res, next) {
        try {
            res.locals.user = await UsersService.getUserById(res.locals.userId);

            if (isUserAdmin(res.locals.user) && roles.includes(Role.kAdmin)) {
                return next();
            }

            if (!res.locals.user.id) {
                return sendUnauthorized(res);
            }

            const { postId, userId /*, TODO: maybe for later [commentId] */ } = req.params;
            let entity = null;
            let field;

            try {
                if (postId) {
                    entity = await PostsService.getPostById(postId);
                    field = Constants.kForeignUserId;
                } else if (userId === res.locals.userId) {
                    entity = res.locals.user;
                    field = Constants.kUserId;
                }
            } catch (err) {
                req.logger.info(
                    `unauthorized access, user_id (cookie): ${res.locals.userId}, postId: ${postId}, userId (param): ${userId}`,
                );
            }

            if (entity && roles.includes(Role.kMortal) && entity[field] === res.locals.user.id) {
                next();
            } else {
                sendUnauthorized(res);
            }
        } catch (err) {
            if (err.message === ErrorCode.kUserInvalidId) {
                sendUnauthorized(res);
            } else {
                next(err);
            }
        }
    };
}

function sendUnauthorized(res) {
    res.status(StatusCode.kOk).send(
        parameterize(sharedMinions.kErrorMessage, { message: "You are not allowed to view this resource" }),
    );
}
