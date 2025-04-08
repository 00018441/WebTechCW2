export class Endpoint {
    static Forms = class {
        static kRegister = "/api/auth/forms/register";
        static kLogin = "/api/auth/forms/login";
        static kNewPost = "/api/forms/posts";
    };

    static Pages = class {
        static kHome = "/";
        static kUsers = "/api/pages/users";
    };

    static Api = class {
        static kLogout = "/api/auth/logout";
        static kRegister = "/api/auth/register";
        static kLogin = "/api/auth/login";
        static kProfile = "/api/users/profile";
        static kUserGet = "/api/users";
        static kUserDelete = "/api/users";
        static kStatusButtons = "/api/auth/status-buttons";
        static kPosts = "/api/posts";
    };
}
