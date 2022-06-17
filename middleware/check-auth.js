const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];  // Authorization: "Bearer TOKEN"
        if (!token) {
            throw new Error("Authentication failed."); // split failed
        }
        const decodedToken = jwt.verify(token, "super_secret_don't_share");
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        const error = new HttpError("Authentication Failed.", 401);
        return next(error);
    }
};
