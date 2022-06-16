const express = require("express");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");

const app = express();
app.use(express.json());

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

app.use("/api/users", usersRoutes);
app.use("/api/places", placesRoutes);
app.use((req, res, next) => {
    throw new HttpError("Could not find this route.", 404);
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
    .connect(
        "mongodb+srv://linda2927:linda2927!@express-api.n8rxcmf.mongodb.net/jisoo?retryWrites=true&w=majority&maxPoolSize=20"
    )
    .then(() => {
        app.listen(4000);
    })
    .catch((err) => {
        console.log(err);
    });
