import users from "./users/index.js";

export const mountRoutes = (app) => {
    app.use("/users", users);
};
