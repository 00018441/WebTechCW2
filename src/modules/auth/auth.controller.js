import Router from "express-promise-router";
import { AuthService } from "./auth.service.js";
import { authMinions } from "./minions/auth-minions.js";
import { getUserIdFromToken } from "#shared/middlewares/index.js";
import { registerSchema, loginSchema } from "./schemas/index.js";
import { sharedMinions } from "#shared/minions/shared-minions.js";
import { validateRequestBody } from "#shared/validators/index.js";
import { Endpoint, StatusCode, ErrorCode } from "#shared/constants/index.js";
import { parameterize, signSuccessMessageCookie } from "#shared/utils/index.js";

export const AuthController = Router();

AuthController.post(Endpoint.Api.kRegister, validateRequestBody(registerSchema), async function (req, res) {
    req.logger.info("start handling");
    try {
        const token = await AuthService.register(req.body);

        signTokenCookie(res, token);

        res.setHeader("HX-Redirect", Endpoint.Pages.kHome);
        signSuccessMessageCookie(
            res,
            parameterize(sharedMinions.kSuccessMessage, { message: "Registration successful!" }),
        );
        res.status(StatusCode.kCreated).send();
    } catch (err) {
        req.logger.warn(`registration failed: ${err.message}`);
        resolveUserCreateConflict(err);

        let errorMessage = "Registration failed.";
        if (err.conflictColumn) {
            errorMessage += ` Please try another ${err.conflictColumn}.`;
        } else {
            errorMessage += "Please try again.";
        }

        res.status(StatusCode.kOk).send(parameterize(sharedMinions.kErrorMessage, { message: errorMessage }));
    }
});

AuthController.post(Endpoint.Api.kLogin, validateRequestBody(loginSchema), async function (req, res) {
    try {
        const token = await AuthService.login(req.body);

        signTokenCookie(res, token);

        res.setHeader("HX-Redirect", Endpoint.Pages.kHome);
        signSuccessMessageCookie(res, parameterize(sharedMinions.kSuccessMessage, { message: "Login successful!" }));
        res.status(StatusCode.kCreated).send();
    } catch (err) {
        req.logger.warn(`login failed: ${err.name}: ${err.message}`);

        if (err.message === ErrorCode.kUserInvalidEmail) {
            res.status(StatusCode.kOk).send(parameterize(sharedMinions.kErrorMessage, { message: "Invalid email" }));
        } else if (err.message == ErrorCode.kUserInvalidPassword) {
            res.status(StatusCode.kOk).send(parameterize(sharedMinions.kErrorMessage, { message: "Invalid password" }));
        } else {
            throw err;
        }
    }
});

AuthController.get(Endpoint.Api.kLogout, (_req, res) => {
    res.clearCookie("accessToken");
    res.setHeader("HX-Redirect", Endpoint.Pages.kHome);

    res.status(StatusCode.kOk).send();
});

AuthController.get(Endpoint.Api.kStatusButtons, getUserIdFromToken, (_req, res) => {
    const isLoggedIn = !!res.locals.userId;

    if (isLoggedIn) {
        res.status(StatusCode.kOk).send(parameterize(authMinions.kLogoutButton, { logoutUrl: Endpoint.Api.kLogout }));
    } else {
        res.status(StatusCode.kOk).send(
            parameterize(authMinions.kLoginRegisterButtons, {
                loginFormUrl: Endpoint.Forms.kLogin,
                registerFormUrl: Endpoint.Forms.kRegister,
            }),
        );
    }
});

AuthController.get(Endpoint.Forms.kRegister, (_req, res) => {
    res.status(StatusCode.kOk).send(parameterize(authMinions.kRegisterForm, { registerUrl: Endpoint.Api.kRegister }));
});

AuthController.get(Endpoint.Forms.kLogin, (_req, res) => {
    res.status(StatusCode.kOk).send(parameterize(authMinions.kLoginForm, { loginUrl: Endpoint.Api.kLogin }));
});

function resolveUserCreateConflict(error) {
    const kUniqueConstraintViolationCode = "23505";
    const kUserEmailConstraint = "users_email_key";
    const kUserUsernameConstraint = "users_username_key";

    if (error.code === kUniqueConstraintViolationCode) {
        if (error.constraint === kUserEmailConstraint) {
            return (error.conflictColumn = "email");
        }

        if (error.constraint === kUserUsernameConstraint) {
            return (error.conflictColumn = "username");
        }
    }
}

function signTokenCookie(res, token) {
    res.clearCookie("accessToken");
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: Number(process.env.AUTH_TOKEN_EXPIRES_IN_MS),
    });
}
