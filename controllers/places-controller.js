const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1',
    },
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => p.id === placeId);
    if (!place) {
        return next(new HttpError('Could not find a place for the provided id.', 404));
    }
    res.json({ place }); // {place} ==> {place: place}
};

// eslint-disable-next-line consistent-return
const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter(p => {
        return p.creator === userId;
    });

    if (!places || places.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404),
        );
    }

    res.json({ places }); // {place} ==> {place: place}
};

const createPlace = (req, res, next) => {
    // TODO: validation needed
    const {
        title,
        description,
        coordinates,
        address,
        creator
    } = req.body;
    const createdPlace = {
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };
    DUMMY_PLACES.push(createdPlace);
    res.status(201)
        .json({ place: createdPlace });

};

const updatePlaceById = (req, res, next) => {
    const {
        title,
        description
    } = req.body;
    const placeId = req.params.pid;
    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }; //copy
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;
    res.status(200)
        .json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId); //이 조건에 일치하는 값만 추출
    res.status(200)
        .json({ message: 'Successfully deleted.' });
};

exports.getPlaceByID = getPlaceById;
exports.getPlacesByUserID = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
