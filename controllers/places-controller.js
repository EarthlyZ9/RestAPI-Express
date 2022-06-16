const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/google-location");
const Place = require("../models/places");
const User = require("../models/users");


const getAllPlaces = async (req, res, next) => {
    let places;
    try {
        places = await Place.find({});
    } catch (err) {
        const error = new HttpError(
            "Could not fetch data, please try again.",
            500
        );
        return next(error);
    }
    if (places.length === 0) {
        return next(new HttpError("Empty data :(", 204));
    }
    res.status(200).json({
        places: places.map((place) => place.toObject({ getters: true })),
    });
};

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not find a place.",
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            "Could not find a place for the provided id.",
            404
        );
        return next(error);
    }
    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    // let userWithPlaces;
    try {
        places = await Place.find({ creator: userId });
        // userWithPlaces = await User.findById(userId).populate("places");
    } catch (err) {
        const error = new HttpError(
            "Fetching places failed, please try again.",
            500
        );
        return next(error);
    }

    if (!places || places.length === 0) {
        return next(
            new HttpError(
                "Could not find places for the provided user id.",
                404
            )
        );
    }

    res.json({
        places: places.map((place) => place.toObject({ getters: true })),
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 442));
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }


    const newPlace = new Place({
        title,
        description,
        image: "https://webimages.mongodb.com/_com_assets/cms/kuzt9r42or1fxvlq2-Meta_Generic.png",
        address,
        location: coordinates,
        creator,
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            "Creating place failed, please try again",
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            "Could not find user for provided id.",
            404
        );
        return next(error);
    }

    try {
        //only when all these tasks are successfully implemented,
        //if not all the tasks are rolled back

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newPlace.save({ session: sess });
        user.places.push(newPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Creating place failed, please try again.",
            500
        );
        return next(error);
    }

    res.status(201).json({ place: newPlace });
};

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 442));
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;

    let updatedPlace;
    try {
        updatedPlace = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not update place.",
            500
        );
        return next(error);
    }

    updatedPlace.title = title;
    updatedPlace.description = description;

    try {
        await updatedPlace.save();
    } catch (err) {
        const error = new HttpError(
            "Failed to update place, please try again",
            500
        );
        return next(error);
    }

    res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        // also search for creator field
        // give full access to the object itself using the creator attrubute
        place = await Place.findById(placeId).populate("creator");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not delete place.",
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError("Could not find place for this id.", 404);
        return next(error);
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Failed to update place, please try again",
            500
        );
        return next(error);
    }

    res.status(200).json({ message: "Successfully deleted." });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceByID = getPlaceById;
exports.getPlacesByUserID = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
