const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
    // #swagger.tags = ['User']
    // #swagger.summary = 'List all users'
    // #swagger.operationId = 'getUsers'
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[500] = { description: 'Something went wrong, please try again.' }
    let users;
    try {
        users = await User.find({}, "-password");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again.",
            500
        );
        return next(error);
    }

    res.status(200).json({
        users: users.map((user) => user.toObject({ getters: true })),
    });
};

const getUserById = async (req, res, next) => {
    // #swagger.tags = ['User']
    // #swagger.summary = 'Get user by Id'
    // #swagger.operationId = 'getUserById'
    /* #swagger.parameters['uid'] = {
            description: "user id",
            in: "path",
            required: true,
            type: "string",
    } */
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[404] = { description: 'Could not find the user for the provided id.' }
    // #swagger.responses[500] = { description: 'Something went wrong, please try again.' }

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
    // #swagger.tags = ['User']
    // #swagger.summary = 'User sign up'
    // #swagger.operationId = 'signup'
    /* #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: { $ref: "#/components/schemas/User" },
                  }
              }
          }
        */
    /* #swagger.responses[201] = {
                description: 'Created user',
                schema: {
                    name: 'Jhon Doe',
                    email: 'example@com',
                    token: 'jwt'
                }
    } */
    // #swagger.responses[422] = { description: 'User with the email exists already.' }
    // #swagger.responses[442] = { description: 'Custom error message from express-validator.' }
    // #swagger.responses[500] = { description: 'Sign up failed, please try again.' }

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
        const error = new HttpError("Sign up failed, please try again.", 500);
        return next(error);
    }


    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: [], //places array will be automatically added
    });

    try {
        await newUser.save();
    } catch (err) {
        const error = new HttpError(
            "Sign up failed, please try again.",
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
        const error = new HttpError("Sign up failed, please try again.", 500);
        return next(error);
    }


    res.status(201).json({ userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, next) => {
    // #swagger.tags = ['User']
    // #swagger.summary = 'User login'
    // #swagger.operationId = 'login'
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[401] = { description: 'Invalid credentials.' }
    // #swagger.responses[442] = { description: 'Custom error message from express-validator.' }
    // #swagger.responses[500] = { description: 'Log in failed, please try again.' }

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
        const error = new HttpError("Log in failed, please try again.", 500);
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
        const error = new HttpError("Log in failed, please try again.", 500);
        return next(error);
    }


    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token: token });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
