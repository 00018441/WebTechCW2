import { UsersController } from "./users/users.controller.js";
import { AuthController } from "./auth/auth.controller.js";
import { PostsController } from "./posts/posts.controller.js";

export const mountRoutes = (app) => {
    app.use("/", AuthController);
    app.use("/", UsersController);
    app.use("/", PostsController);
};
