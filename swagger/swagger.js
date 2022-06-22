const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const options = {
    info: {
        title: "Express Rest API",
        description: "First step of building a MERN Stack",
    },
    servers: [
        {
            url: "http://localhost:4000",
        },
    ],
    schemes: ["http"],
    tags: [
        {
            name: "User",
            description: "Managing users",
        },
        {
            name: "Place",
            description: "Managing places",
        },
        {
            name: "test",
            description: "Managing test",
        },

    ],
    components: {
        schemas: {
            User: {
                type: "object",
                required: ["name", "email", "password", "image"],
                properties: {
                    _id: {
                        "type": "string"
                    },
                    name: {
                        "type": "string"
                    },
                    email: {
                        "type": "string"
                    },
                    password: {
                        "type": "string"
                    },
                    image: {
                        "type": "string"
                    },
                    places: {
                        "type": "array"
                    }
                }
            },
            Place: {
                type: "object",
                required: ["name", "email", "password", "image"],
                properties: {
                    _id: {
                        "type": "string"
                    },
                    title: {
                        "type": "string"
                    },
                    description: {
                        "type": "string"
                    },
                    image: {
                        "type": "string"
                    },
                    address: {
                        "type": "string"
                    },
                    location: {
                        "type": "object",
                        "properties": {
                            lat: {
                                "type": "integer"
                            },
                            lng: {
                                "type": "integer"
                            }
                        }
                    },
                    creator: {
                        "type": "string"
                    }
                }
            }
        },
    },
    securityDefinitions: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            in: "header",
            bearerFormat: "JWT",
        },
    },

};
const outputFile = "./swagger/swagger-output.json";
const endpointsFiles = ["./app.js"];
swaggerAutogen(outputFile, endpointsFiles, options);
