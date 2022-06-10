const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controller");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceByID);
router.get("/user/:uid", placesControllers.getPlacesByUserID);
router.post(
    "/",
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
router.patch("/:pid", [
    check("title").not().isEmpty().withMessage("Title should not be empty."),
    check("description")
        .isLength({ min: 5 })
        .withMessage("Description should be more than 5 letters minimum."),
]);
router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
