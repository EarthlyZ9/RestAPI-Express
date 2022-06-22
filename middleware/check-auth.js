const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];  // Authorization: "Bearer [TOKEN]"
        if (!token) {
            throw new Error("Authentication failed."); // split failed
        }
        // eslint-disable-next-line no-undef
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userData = { userId: decodedToken.userId };
        next(); // 다른 라우트를 계속 탐색할 수 있게 함 routes.js
    } catch (err) {
        const error = new HttpError("Authentication Failed.", 401);
        return next(error);
    }
};
