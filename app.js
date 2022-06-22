const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger/swagger-output.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/uploads/images/users", express.static(path.join("uploads", "images", "users")));
app.use("/uploads/images/places", express.static(path.join("uploads", "images", "places")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With", "Content-Type", "Accept", "Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});


app.use("/api/users", usersRoutes);
app.use("/api/places", placesRoutes);
app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerFile, { explorer: true })
);

app.use((req, res, next) => {
    throw new HttpError("Could not find this route.", 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
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
