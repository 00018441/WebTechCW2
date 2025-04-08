import { query } from "#db/index.js";
import { sqlQueries } from "#db/sql-queries.js";
import { parameterize } from "#shared/utils/index.js";
import { BadRequestError } from "#shared/errors/index.js";
import { ErrorCode } from "#shared/constants/index.js";

export class UsersService {
    static async createUser(userCredentials) {
        const { rows, rowCount } = await query(sqlQueries.kInsertUser, [
            userCredentials.username,
            userCredentials.email,
            userCredentials.passwordHash,
        ]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kUserConflictingCredentials);
        }

        return rows[0]["id"];
    }

    static async getUserByEmail(email) {
        const { rows, rowCount } = await query(parameterize(sqlQueries.kSelectUserForProfile, { param: "email" }), [
            email,
        ]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kUserInvalidEmail);
        }

        return rows[0];
    }

    static async getUserById(id) {
        const { rows, rowCount } = await query(parameterize(sqlQueries.kSelectUserForProfile, { param: "id" }), [id]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kUserInvalidId);
        }

        return rows[0];
    }

    static async getPublicUserInfo(id) {
        const { rows, rowCount } = await query(sqlQueries.kSelectUserForMortals, [id]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kUserInvalidId);
        }

        return rows[0];
    }

    static async getUsers(page, limit, username) {
        return (await query(sqlQueries.kSelectUsers, [`%${username}%`, page * limit, limit])).rows;
    }

    static async deleteUser(id) {
        const { rowCount } = await query(sqlQueries.kDeleteUser, [id]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kUserInvalidId);
        }

        return rowCount;
    }
}
