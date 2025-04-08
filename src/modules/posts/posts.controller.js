import Router from "express-promise-router";
import { format } from "timeago.js";
import { PostsService } from "./posts.service.js";
import { postsMinions } from "./minions/posts-minions.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { parameterize } from "#shared/utils/parameterize-ejs.util.js";
import { createPostSchema, postsParamsSchema } from "./schemas/index.js";
import { getUserFromToken } from "#shared/middlewares/index.js";
import { StatusCode, Endpoint, Role, ErrorCode } from "#shared/constants/index.js";
import { validateRequestBody, validateQueryParams } from "#shared/validators/index.js";
import { signSuccessMessageCookie, isRepeatedRequest, isEmpty } from "#shared/utils/index.js";

export const PostsController = Router();

PostsController.get(Endpoint.Forms.kNewPost, getUserFromToken, async function (req, res) {
    try {
        req.logger.info(`sending post create form to user: ${res.locals.userId}`);
        if (!res.locals.userId) {
            return res.status(StatusCode.kOk).send(
                parameterize(sharedMinions.kErrorMessage, {
                    message: "You are not allowed to view this resource",
                }),
            );
        }

        res.status(StatusCode.kOk).send(
            parameterize(postsMinions.kCreatePostForm, { createPostUrl: Endpoint.Api.kPosts }),
        );
    } catch (err) {
        throw err;
    }
});

PostsController.post(
    Endpoint.Api.kPosts,
    validateRequestBody(createPostSchema),
    getUserFromToken,
    async function (req, res) {
        try {
            req.logger.info(`create post request from user: ${res.locals.userId}`);
            if (!res.locals.userId) {
                return res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, {
                        message: "You are not allowed to view this resource",
                    }),
                );
            }

            const { title, description } = req.body;

            await PostsService.createPost({ title, description, userId: res.locals.userId });

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

PostsController.get(Endpoint.Pages.kPosts, validateQueryParams(postsParamsSchema), async function (req, res) {
    try {
        const { page = 0, limit = 15, title = "", description = "" } = req.query;

        const posts = await PostsService.getPosts(page, limit, title, description);
        req.logger.info(
            `fetched ${posts.length} posts: page=${page}, limit=${limit}, title=${title}, description=${description}`,
        );

        const cards = posts
            .map((post) => {
                return parameterize(postsMinions.kPostCard, {
                    title: post.title,
                    usernameWithTooltip: parameterize(postsMinions.kUsernameWithTooltip, {
                        username: post["username"],
                        userStatus: post["status"],
                        publicUserInfoUrl: `${Endpoint.Api.kUserGet}/${post["user_id"]}`,
                    }),
                    description:
                        post.description.length > 150 ? post.description.slice(0, 150) + "…" : post.description,
                    createdAgo: format(post["created_at"]),
                    postSettingsCount: post["post_settings_count"],
                });
            })
            .join("");

        // emit an event if no posts left so
        // frontend can hide the load more button
        const loadMoreButton =
            posts.length === limit
                ? parameterize(postsMinions.kLoadMoreButton, {
                      postsListUrl: Endpoint.Pages.kPosts,
                      page: page + 1,
                      limit,
                      title,
                      description,
                  })
                : (() => (res.setHeader("HX-Trigger", "no-more-posts"), ""))();

        let response = parameterize(postsMinions.kPostsPage, {
            postCards: cards,
            postsListUrl: Endpoint.Pages.kPosts,
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
});
