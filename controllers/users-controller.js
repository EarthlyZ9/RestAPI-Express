const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

let DUMMY_USERS = [
    {
        id: "u1",
        name: "Jisoo Lee",
        email: "linda2927@naver.com",
        password: "linda2927",
    },
];

const getUsers = (req, res, next) => {
    if (DUMMY_USERS.length === 0) {
        return next(new HttpError("Empty data :("));
    }
    res.status(200).json({ users: DUMMY_USERS });
};

const getUserById = (req, res, next) => {
    const userId = req.params.uid;
    const user = DUMMY_USERS.find((p) => p.id === userId);
    if (user === undefined) {
        return next(
            new HttpError("Could not find the user for the provided id.", 404)
        );
    }
    res.status(200).json({ user });
};

const signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg), 442);
    }
    const { name, email, password } = req.body;
    const newUser = {
        id: uuidv4(),
        name,
        email,
        password,
    };
    DUMMY_USERS.push(newUser);
    res.status(201).json({ user: newUser });
};

const login = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg), 442);
    }
    const { email, password } = req.body;
    const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
    if (identifiedUser === undefined || identifiedUser.password !== password) {
        return next(
            new HttpError(
                "Could not identify user, check your credentials.",
                401
            )
        );
    }

    res.json({ message: "Logged In" });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
