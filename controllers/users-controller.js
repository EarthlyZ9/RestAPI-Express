const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, "-password");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again",
            500
        );
        return next(error);
    }

    res.status(200).json({
        users: users.map((user) => user.toObject({ getters: true })),
    });
};

const getUserById = async (req, res, next) => {
    const userId = req.params.uid;
    let user;
    try {
        user = await User.findById(userId, "-password");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again.",
            500
        );
        return next(error);
    }
    if (user === undefined) {
        return next(
            new HttpError("Could not find the user for the provided id.", 404)
        );
    }
    res.status(200).json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg), 442);
    }
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError("Sign up failed, please try again.", 500);
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError("User with the email exists already.", 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Could not create user, please try again.", 500);
        return next(error);
    }


    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        image: "https://webimages.mongodb.com/_com_assets/cms/kuzt9r42or1fxvlq2-Meta_Generic.png",
        places: [], //places array will be automatically added
    });

    try {
        await newUser.save();
    } catch (err) {
        const error = new HttpError(
            "Creating user failed, please try again.",
            500
        );
        return next(error);
    }

    let token;
    try {
        token = await jwt.sign(
            { userId: newUser.id, email: newUser.email },
            "super_secret_don't_share",
            { expiresIn: "1h" }
        );
    } catch (err) {
        const error = new HttpError("Sign up failed, please try again later.", 500);
        return next(error);
    }


    res.status(201).json({ userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg), 442);
    }
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError("Log in failed, please try again.", 500);
        return next(error);
    }
    if (!existingUser) {
        const error = new HttpError("Invalid credentials", 401);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError("Could not log you in, please check your credentials.", 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError("Invalid credentials", 401);
        return next(error);
    }

    let token;
    try {
        token = await jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            "super_secret_don't_share",
            { expiresIn: "1h" }
        );
    } catch (err) {
        const error = new HttpError("Log in failed, please try again later.", 500);
        return next(error);
    }


    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token: token });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
