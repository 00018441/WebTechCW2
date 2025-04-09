import { BadRequestError } from "#shared/errors/index.js";
import { PostsService } from "#modules/posts/posts.service.js";
import { UsersService } from "#modules/users/users.service.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { StatusCode, AuthorizationMode, ErrorCode, Role, Constants } from "#shared/constants/index.js";
import { isUserAdmin, parameterize, convertToSnakeCase } from "#shared/utils/index.js";

export function authorizeAccess(mode, ...roles) {
    return async function (req, res, next) {
        try {
            res.locals.user = await UsersService.getUserById(res.locals.userId);
            res.locals.isAuthorized = false;

            if (isUserAdmin(res.locals.user) && roles.includes(Role.kAdmin)) {
                res.locals.isAuthorized = true;
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
                     postSettingId: ${postSettingId},
                     error: ${err.message}`,
                );
            }

            req.logger.debug(`entity ${JSON.stringify(entity)}, field ${field}`);

            if (!entity || !res.locals.user?.id) {
                return sendUnauthorized(mode, res, next);
            }

            if (roles.includes(Role.kMortal) && entity[field] === res.locals.user.id) {
                res.locals.isAuthorized = true;
                next();
            } else {
                sendUnauthorized(mode, res, next);
            }
        } catch (err) {
            if ([ErrorCode.kUserInvalidId, ErrorCode.kPostInvalidId].includes(err.message)) {
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, {
                        message: "Something went wrong. The request is likely malformed.",
                    }),
                );
            } else {
                next(err);
            }
        }
    };
}

function sendUnauthorized(mode, res, next) {
    if (mode === AuthorizationMode.kSoft) {
        return next();
    }

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
