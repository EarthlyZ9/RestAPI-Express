const fs = require("fs");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/google-location");
const Place = require("../models/places");
const User = require("../models/users");


const getAllPlaces = async (req, res, next) => {
    // #swagger.tags = ['Place']
    // #swagger.summary = 'List all places'
    // #swagger.operationId = 'getAllPlaces'
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[204] = { description: 'Empty data :(' }
    // #swagger.responses[500] = { description: 'Could not fetch data, please try again.' }

    let places;
    try {
        places = await Place.find({});
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again.",
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
    // #swagger.tags = ['Place']
    // #swagger.summary = 'Get place by Id'
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

    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again.",
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
    // #swagger.tags = ['Place']
    // #swagger.summary = 'Retrieve places by user Id'
    // #swagger.operationId = 'getPlacesByUserId'
    /* #swagger.parameters['uid'] = {
            description: 'user id',
            in: "path",
            required: true,
            type: 'string',
    } */
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[404] = { description: 'Could not find a place for the provided user id.' }
    // #swagger.responses[500] = { description: 'Something went wrong, please try again.' }

    const userId = req.params.uid;
    let places;
    // let userWithPlaces;
    try {
        places = await Place.find({ creator: userId });
        // userWithPlaces = await User.findById(userId).populate("places");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again.",
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
    // #swagger.tags = ['Place']
    // #swagger.summary = 'Create place'
    // #swagger.operationId = 'getPlaceByUserId'
    /* #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: { $ref: "#/components/schemas/Place" }
                  }
              }
          }
        */
    /* #swagger.responses[201] = {
            description: 'Created place',
            schema: { $ref: "#/components/schemas/Place" }
    } */
    // #swagger.responses[404] = { description: 'Could not find a user for provided id.' }
    // #swagger.responses[500] = { description: 'Something went wrong, please try again.' }

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
        image: req.file.path,
        location: coordinates,
        creator,
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, please try again.",
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
            "Something went wrong, please try again.",
            500
        );
        return next(error);
    }

    res.status(201).json({ place: newPlace });
};

const updatePlaceById = async (req, res, next) => {
    // #swagger.tags = ['Place']
    // #swagger.summary = 'Update place by Id'
    // #swagger.operationId = 'updatePlaceById'
    /* #swagger.responses[200] = {
                description: 'Update title and description of a place',
                schema: {
                    title: 'Empire State Building',
                    description: 'ny',
                }
    } */
    // #swagger.responses[404] = { description: 'Could not find a place for provided id.' }
    // #swagger.responses[500] = { description: 'Something went wrong, please try again.' }

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

    if (!updatedPlace) {
        const error = new HttpError("Could not find a place with provided id.", 404);
        return next(error);
    }

    updatedPlace.title = title;
    updatedPlace.description = description;

    try {
        await updatedPlace.save();
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not update place.",
            500
        );
        return next(error);
    }

    res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    // #swagger.tags = ['Place']
    // #swagger.summary = 'Delete place by Id'
    // #swagger.operationId = 'deletePlace'
    // #swagger.responses[200] = { description: 'Successfully deleted.' }
    // #swagger.responses[500] = { description: 'Something went wrong, please try again.' }

    const placeId = req.params.pid;
    let place;
    try {
        // also search for creator field
        // give full access to the object itself using the creator attribute
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

    const imagePath = place.image;

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

    // delete image when deleting place
    fs.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({ message: "Successfully deleted." });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceByID = getPlaceById;
exports.getPlacesByUserID = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
