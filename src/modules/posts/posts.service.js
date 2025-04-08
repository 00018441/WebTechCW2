import { query } from "#db/index.js";
import { sqlQueries } from "#db/sql-queries.js";
import { parameterize } from "#shared/utils/index.js";
import { BadRequestError } from "#shared/errors/index.js";
import { ErrorCode } from "#shared/constants/index.js";

export class PostsService {
    static async createPost(postDto) {
        const { rowCount } = await query(sqlQueries.kInsertPost, [postDto.userId, postDto.title, postDto.description]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kUserInvalidId);
        }
    }

    static async getPostById(id) {
        const { rows, rowCount } = await query(sqlQueries.kSelectPostInternal, [id]);

        if (rowCount === 0) {
            throw new BadRequestError(ErrorCode.kPostInvalidId);
        }

        return rows[0];
    }

    // static async getPublicUserInfo(id) {
    //     const { rows, rowCount } = await query(sqlQueries.kSelectUserForMortals, [id]);
    //
    //     if (rowCount === 0) {
    //         throw new BadRequestError(ErrorCode.kUserInvalidId);
    //     }
    //
    //     return rows[0];
    // }
    //
    // static async getPosts(page, limit, username) {
    //     return (await query(sqlQueries.kSelectPosts, [`%${username}%`, page * limit, limit])).rows;
    // }
    //
    // static async deleteUser(id) {
    //     const { rowCount } = await query(sqlQueries.kDeleteUser, [id]);
    //
    //     if (rowCount === 0) {
    //         throw new BadRequestError(ErrorCode.kUserInvalidId);
    //     }
    //
    //     return rowCount;
    // }
}
