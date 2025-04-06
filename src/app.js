import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import layouts from "express-ejs-layouts";
import { mountRoutes } from "#modules/index.js";
import { StatusCode } from "#shared/constants/index.js";
import { requestContextMiddleware } from "#shared/middlewares/index.js";
import { requestLogger, responseHeaderMiddleware, notFoundHandler, errorHandler } from "#shared/middlewares/index.js";

export const app = express();

app.set("view engine", "ejs");
app.set("views", [path.join(import.meta.dirname, "views"), path.join(import.meta.dirname, "modules")]);

app.use(layouts);
app.use(express.static("src/public"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestContextMiddleware);
app.use(requestLogger);
app.use(responseHeaderMiddleware);

mountRoutes(app);

app.get("/", (req, res) => {
    req.logger.info("start handling");
    res.status(StatusCode.kOk).render("home");
});

app.use(notFoundHandler);
app.use(errorHandler);
