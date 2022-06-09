const express = require('express');
const placesControllers = require('../controllers/places-controller');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceByID);
router.get('/user/:uid', placesControllers.getPlacesByUserID);
router.post('/', placesControllers.createPlace);
router.patch('/:pid', placesControllers.updatePlaceById);
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
