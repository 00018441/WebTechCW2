import { PostsService } from "#modules/posts/posts.service.js";
import { UsersService } from "#modules/users/users.service.js";
import { StatusCode, ErrorCode, Role, Constants } from "#shared/constants/index.js";
import { BadRequestError } from "#shared/errors/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { convertToSnakeCase } from "#shared/utils/convert-to-snake-case.util";
import { isUserAdmin, parameterize } from "#shared/utils/index.js";

export function authorizeAccess(...roles) {
    return async function (req, res, next) {
        try {
            res.locals.user = await UsersService.getUserById(res.locals.userId);

            if (isUserAdmin(res.locals.user) && roles.includes(Role.kAdmin)) {
                return next();
            }

            const { postId, userId, commentId, postSettingId } = req.params;
            const [isSingleParam, entityLabel] = soleOwnershipParam(postId, userId, commentId, postSettingId);
            if (!isSingleParam) {
                req.logger.error(`ownership error, either more than one param or no params have a value, throwing err`);
                throw new BadRequestError(ErrorCode.kMultipleParams);
            }

            let entity = null;
            let field = undefined;
            try {
                switch (entityLabel) {
                    case Constants.kPostId:
                        entity = await PostsService.getPostById(postId);
                        field = Constants.kUserId;
                        break;
                    case Constants.kCommentId:
                        // TODO: implement comments service
                        break;
                    case Constants.kPostSettingId:
                        // TODO: implement post settings service
                        break;
                    case Constants.kUserId:
                        entity = await UsersService.getUserById(userId);
                        field = Constants.kLocalUserId;
                        break;
                    default:
                        throw new BadRequestError(ErrorCode.kMultipleParams);
                }
            } catch (err) {
                req.logger.info(
                    `unauthorized access, user_id (cookie): ${res.locals.userId},
                     postId: ${postId},
                     userId (param): ${userId},
                     commentId: ${commentId},
                     postSettingId: ${postSettingId}`,
                );
            }

            if (!entity || !res.locals.user?.id) {
                return sendUnauthorized(res);
            }

            if (roles.includes(Role.kMortal) && entity[field] === res.locals.user.id) {
                next();
            } else {
                sendUnauthorized(res);
            }
        } catch (err) {
            if ([ErrorCode.kUserInvalidId, ErrorCode.kPostInvalidId].includes(err.message)) {
                parameterize(sharedMinions.kErrorMessage, {
                    message: "Something went wrong. The request is likely malformed.",
                });
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

function soleOwnershipParam(postId, userId, commentId, postSettingId) {
    const params = { postId, userId, commentId, postSettingId };
    const paramsWithValue = Object.entries(params).filter(([_, value]) => value !== undefined);

    if (paramsWithValue.length === 1) {
        const [paramName] = paramsWithValue[0];
        return [true, convertToSnakeCase(paramName)];
    } else {
        return [false, undefined];
    }
}
