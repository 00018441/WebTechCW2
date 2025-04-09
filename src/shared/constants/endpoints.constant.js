export class Endpoint {
    static Forms = class {
        static kRegister = "/api/auth/forms/register";
        static kLogin = "/api/auth/forms/login";
        static kNewPost = "/api/forms/posts";
        static kPostUpdate = "/api/forms/posts";
    };

    static Pages = class {
        static kHome = "/";
        static kUsers = "/api/pages/users";
        static kPosts = "/api/pages/posts";
        static kPost = "/api/pages/posts";
    };

    static Api = class {
        static kLogin = "/api/auth/login";
        static kLogout = "/api/auth/logout";
        static kRegister = "/api/auth/register";
        static kStatusButtons = "/api/auth/status-buttons";

        static kProfile = "/api/users/profile";
        static kUserGet = "/api/users";
        static kUserDelete = "/api/users";

        static kPosts = "/api/posts";
        static kPostDelete = "/api/posts";
        static kPostUpdate = "/api/posts";
    };
}
