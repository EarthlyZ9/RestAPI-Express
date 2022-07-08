const axios = require("axios");
const HttpError = require("../models/http-error");
require("dotenv").config();

async function getAddressData(address) {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?language=ko&address=${encodeURIComponent(
            address
            // eslint-disable-next-line no-undef
        )}&key=${process.env.GEOCODING_API_KEY}`
    );

    const data = response.data;

    if (!data || data.status == "ZERO_RESULTS") {
        throw new HttpError(
            "Could not find location for the specified address.",
            422
        );
    }

    const addressData = {
        coordinates: data.results[0].geometry.location,
        formatted_address: data.results[0].formatted_address
    };

    return addressData;
}

module.exports = getAddressData;

