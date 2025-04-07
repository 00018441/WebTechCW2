import { ServerError, AuthenticationError } from "#shared/errors/index.js";
import { UsersService } from "#modules/users/users.service.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { log } from "#shared/middlewares/index.js";
import { ErrorCode } from "#shared/constants/index.js";

export class AuthService {
    static async register(userCredentials) {
        const { username, email, password } = userCredentials;

        const newUser = {
            username,
            email,
            passwordHash: await this.hashPassword(password),
        };

        const userId = await UsersService.createUser(newUser);
        log("INFO", `new user with id=${userId}`);

        return this.generateToken(userId);
    }

    static async login(userCredentials) {
        const { email, password } = userCredentials;

        const user = await UsersService.getUserByEmail(email);
        log("INFO", `fetched user with email=${email}: ${JSON.stringify(user)}`);

        const isPasswordValid = await this.verifyPassword(password, user["password_hash"]);
        if (isPasswordValid) {
            return this.generateToken(user["id"]);
        }

        throw new AuthenticationError(ErrorCode.kUserInvalidPassword);
    }

    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);

        return bcrypt.hash(password, salt);
    }

    static generateToken(id) {
        const key = process.env.SECRET_JWT_KEY;
        const expirationTimeSeconds = Number(process.env.AUTH_TOKEN_EXPIRES_IN_MS) / 1000;

        if (!key || !expirationTimeSeconds) {
            throw new ServerError("jwt key or exp time not found");
        }

        return jwt.sign({ id }, key, {
            expiresIn: expirationTimeSeconds,
        });
    }

    static verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
