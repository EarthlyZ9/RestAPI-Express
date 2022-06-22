const express = require("express");
const { check } = require("express-validator");
const usersControllers = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersControllers.getUsers);
router.get("/:uid", usersControllers.getUserById);
router.post(
    "/signup",
    fileUpload.userFileUpload.single("image"),
    [
        check("name").not().isEmpty().withMessage("User name is required."),
        check("email")
            .normalizeEmail()
            .isEmail()
            .withMessage("Invalid email input."),
        check("password")
            .isLength({ min: 8 })
            .withMessage("Password should be at least 8 letters."),
    ],
    usersControllers.signup
);
router.post(
    "/login",
    check("email")
        .normalizeEmail()
        .isEmail()
        .withMessage("Invalid email input"),
    usersControllers.login
);

module.exports = router;
