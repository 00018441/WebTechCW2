import { Role } from "#shared/constants/index.js";

export function isUserAdmin(user) {
    return user?.role === Role.kAdmin;
}
