import Router from "express-promise-router";
import { PostsService } from "./posts.service.js";
import { createPostSchema } from "./schemas/index.js";
import { postsMinions } from "./minions/posts-minions.js";
import { signSuccessMessageCookie } from "#shared/utils/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { validateRequestBody } from "#shared/validators/index.js";
import { parameterize } from "#shared/utils/parameterize-ejs.util.js";
import { StatusCode, Endpoint, Role, ErrorCode } from "#shared/constants/index.js";
import { getUserFromToken, authorizeAccess } from "#shared/middlewares/index.js";

export const PostsController = Router();

PostsController.get(
    Endpoint.Forms.kNewPost,
    getUserFromToken,
    authorizeAccess(Role.kMortal, Role.kAdmin),
    async function (req, res) {
        try {
            req.logger.info(`sending post create form to user: ${res.locals.user.id}`);
            res.status(StatusCode.kOk).send(
                parameterize(postsMinions.kCreatePostForm, { createPostUrl: Endpoint.Api.kPosts }),
            );
        } catch (err) {
            throw err;
        }
    },
);

PostsController.post(
    Endpoint.Api.kPosts,
    validateRequestBody(createPostSchema),
    getUserFromToken,
    authorizeAccess(Role.kMortal, Role.kAdmin),
    async function (req, res) {
        try {
            req.logger.info(`create post request from user: ${res.locals.user.id}`);
            const { title, description } = req.body;

            await PostsService.createPost({ title, description, userId: res.locals.user.id });

            res.setHeader("HX-Redirect", Endpoint.Pages.kHome);
            signSuccessMessageCookie(
                res,
                parameterize(sharedMinions.kSuccessMessage, { message: "Post created successfully" }),
            );
            res.status(StatusCode.kCreated).send();
        } catch (err) {
            if (err.message === ErrorCode.kUserInvalidId) {
                req.logger.warn(`non existent user_id (${res.locals.user.id}) passed to query`);
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, { message: "You are not allowed to view this resource" }),
                );
            } else {
                throw err;
            }
        }
    },
);
