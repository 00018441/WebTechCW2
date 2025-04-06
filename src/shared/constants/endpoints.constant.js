export class Endpoint {
    static Forms = class {
        static kRegister = "/api/auth/forms/register";
        static kLogin = "/api/auth/forms/login";
    };

    static Pages = class {
        static kHome = "/";
    };

    static Minions = class {
        static kStatusButtons = "/api/auth/minions/status-buttons";
    };

    static Api = class {
        static kLogout = "/api/auth/logout";
        static kRegister = "/api/auth/register";
        static kLogin = "/api/auth/login";
        static kProfile = "/api/users/profile";
    };
}
