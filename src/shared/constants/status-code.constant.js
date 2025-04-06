export class StatusCode {
    static kOk = 200;
    static kCreated = 201;
    static kAccepted = 202;
    static kNoContent = 204;

    static kBadRequest = 400;
    static kUnauthenticated = 401;
    static kForbidden = 403;
    static kNotFound = 404;
    static kMethodNotAllowed = 405;
    static kNotAcceptable = 406;
    static kRequestTimeout = 408;

    static kServerError = 500;
    static kNotImplemented = 501;
    static kBadGateway = 502;
    static kServiceUnavailable = 503;
    static kGatewayTimeout = 504;
}
