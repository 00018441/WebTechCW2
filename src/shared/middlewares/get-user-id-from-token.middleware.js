import jwt from "jsonwebtoken";

export function getUserIdFromToken(req, res, next) {
    const token = req.cookies.accessToken;
    const key = process.env.SECRET_JWT_KEY;

    if (!token || !key) {
        return next();
    }

    jwt.verify(token, key, async (err, decodedToken) => {
        try {
            if (err) {
                return next();
            } else {
                if (typeof decodedToken == "object") {
                    res.locals.userId = decodedToken.id;
                } else {
                    res.locals.userId = decodedToken;
                }

                next();
            }
        } catch (err) {
            next(err);
        }
    });
}
