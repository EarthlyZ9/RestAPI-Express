const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controller");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", placesControllers.getAllPlaces);
router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlacesByUserId);
router.use(checkAuth); // request without token will not reach the bottom middlewares
router.post(
    "/",
    fileUpload.placeFileUpload.single("image"),
    [
        check("title")
            .not()
            .isEmpty()
            .withMessage("Title should not be empty."),
        check("description")
            .isLength({ min: 5 })
            .withMessage("Description should be more than 5 letters minimum."),
        check("address")
            .not()
            .isEmpty()
            .withMessage("Address should not be empty."),
    ],
    placesControllers.createPlace
);
router.patch(
    "/:pid",
    [
        check("title")
            .not()
            .isEmpty()
            .withMessage("Title should not be empty."),
        check("description")
            .isLength({ min: 5 })
            .withMessage("Description should be more than 5 letters minimum."),
    ],
    placesControllers.updatePlaceById
);
router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
