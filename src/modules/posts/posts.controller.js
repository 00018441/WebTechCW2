import Router from "express-promise-router";
import { format } from "timeago.js";
import { PostsService } from "./posts.service.js";
import { postsMinions } from "./minions/posts-minions.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { parameterize } from "#shared/utils/parameterize-ejs.util.js";
import { authorizeAccess, getUserIdFromToken } from "#shared/middlewares/index.js";
import { validateRequestBody, validateQueryParams } from "#shared/validators/index.js";
import { createPostSchema, postsParamsSchema, updatePostSchema } from "./schemas/index.js";
import { signSuccessMessageCookie, isRepeatedRequest, isEmpty } from "#shared/utils/index.js";
import { StatusCode, Endpoint, Role, ErrorCode, AuthorizationMode } from "#shared/constants/index.js";

export const PostsController = Router();

PostsController.get(Endpoint.Forms.kNewPost, getUserIdFromToken, async function (req, res) {
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
            parameterize(postsMinions.kCreateUpdatePostForm, {
                method: "post",
                titleAction: "Create New",
                buttonAction: "Create",
                titleValue: "",
                descriptionValue: "",
                createUpdatePostUrl: Endpoint.Api.kPosts,
            }),
        );
    } catch (err) {
        throw err;
    }
});

PostsController.post(
    Endpoint.Api.kPosts,
    validateRequestBody(createPostSchema),
    getUserIdFromToken,
    async function (req, res) {
        try {
            req.logger.info(`create post request from user: ${res.locals.userId}`);
            if (!res.locals.userId) {
                return res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, {
                        message: "You are not allowed to access this resource",
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
                    viewPostUrl: `${Endpoint.Pages.kPosts}/${post.id}`,
                    usernameWithTooltip: parameterize(postsMinions.kUsernameWithTooltip, {
                        username: post["username"],
                        userStatus: post["status"],
                        publicUserInfoUrl: `${Endpoint.Api.kUserGet}/${post["user_id"]}`,
                    }),
                    description:
                        post.description.length > 350 ? post.description.slice(0, 350) + "…" : post.description,
                    updatedAgo: format(post["updated_at"], "en_US"),
                    createdAgo: format(post["created_at"], "en_US"),
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

PostsController.get(
    `${Endpoint.Pages.kPosts}/:postId`,
    getUserIdFromToken,
    authorizeAccess(AuthorizationMode.kSoft, Role.kMortal, Role.kAdmin),
    async function (req, res) {
        try {
            const post = await PostsService.getPostById(req.params.postId);

            res.status(StatusCode.kOk).send(
                parameterize(postsMinions.kPostDetailPage, {
                    title: post.title,
                    updatedAgo: format(post["updated_at"], "en_US"),
                    createdAgo: format(post["created_at"], "en_US"),
                    description: post.description,
                    author: parameterize(postsMinions.kUsernameWithTooltip, {
                        username: post["username"],
                        userStatus: post["status"],
                        publicUserInfoUrl: `${Endpoint.Api.kUserGet}/${post["user_id"]}`,
                    }),
                    editDeleteButtons: res.locals.isAuthorized
                        ? parameterize(postsMinions.kPostEditDeleteButtons, {
                              postEditUrl: `${Endpoint.Forms.kPostUpdate}/${post.id}`,
                              postDeleteUrl: `${Endpoint.Api.kPosts}/${post.id}`,
                          })
                        : "",
                    postSettingsCount: post["post_settings_count"],
                }),
            );
        } catch (err) {
            throw err;
        }
    },
);

PostsController.delete(
    `${Endpoint.Api.kPostDelete}/:postId`,
    getUserIdFromToken,
    authorizeAccess(AuthorizationMode.kHard, Role.kMortal, Role.kAdmin),
    async function (req, res) {
        try {
            const { postId } = req.params;
            await PostsService.deletePost(postId);
            req.logger.info(`deleted post ${postId}`);

            res.setHeader("HX-Redirect", Endpoint.Pages.kHome);
            signSuccessMessageCookie(
                res,
                parameterize(sharedMinions.kSuccessMessage, { message: "Post deleted successfully!" }),
            );
            res.status(StatusCode.kNoContent).send();
        } catch (err) {
            if (err.message === ErrorCode.kPostInvalidId) {
                req.logger.info(`failed to delete post, invalid id`);
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, { message: "Invalid post Id" }),
                );
            } else {
                throw err;
            }
        }
    },
);

PostsController.get(
    `${Endpoint.Forms.kPostUpdate}/:postId`,
    getUserIdFromToken,
    authorizeAccess(AuthorizationMode.kHard, Role.kMortal, Role.kAdmin),
    async function (req, res) {
        try {
            const post = res.locals.entity;
            req.logger.info(
                `post: ${JSON.stringify(post)}, postId: ${req.params.postId}, isAuthorized: ${res.locals.isAuthorized}`,
            );

            res.status(StatusCode.kOk).send(
                parameterize(postsMinions.kCreateUpdatePostForm, {
                    method: "patch",
                    titleAction: "Update",
                    buttonAction: "Update",
                    titleValue: post?.title,
                    descriptionValue: post?.description,
                    createUpdatePostUrl: `${Endpoint.Api.kPosts}/${post?.id}`,
                }),
            );
        } catch (err) {
            if (err.message === ErrorCode.kPostInvalidId) {
                req.logger.info(`failed to update post, invalid id`);
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, {
                        message: "Something went wrong. The post Id is likely invalid",
                    }),
                );
            } else {
                throw err;
            }
        }
    },
);

PostsController.patch(
    `${Endpoint.Api.kPostUpdate}/:postId`,
    validateRequestBody(updatePostSchema),
    getUserIdFromToken,
    authorizeAccess(AuthorizationMode.kHard, Role.kMortal, Role.kAdmin),
    async function (req, res) {
        try {
            const { postId } = req.params;
            const { title, description } = req.body;
            req.logger.info(`post update dto: postId (${postId}), title (${title}), description (${description})`);

            await PostsService.updatePost({ postId, title, description });

            res.setHeader("HX-Redirect", Endpoint.Pages.kHome);
            signSuccessMessageCookie(
                res,
                parameterize(sharedMinions.kSuccessMessage, { message: "Post updated successfully!" }),
            );
            res.status(StatusCode.kNoContent).send();
        } catch (err) {
            if (err.message === ErrorCode.kPostInvalidId) {
                req.logger.info(`failed to update post, invalid id`);
                res.status(StatusCode.kOk).send(
                    parameterize(sharedMinions.kErrorMessage, {
                        message: "Something went wrong. The post Id is likely invalid",
                    }),
                );
            } else {
                throw err;
            }
        }
    },
);
