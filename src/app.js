import express from "express";
import { mountRoutes } from "#routes/index.js";
import {
    requestLogger,
    notFoundHandler,
    errorHandler,
} from "#shared/middlewares/index.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

mountRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);
