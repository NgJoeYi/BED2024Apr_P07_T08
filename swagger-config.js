const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
      description: "A description of your API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./*.js", "./controllers/*.js"], // Path to the API docs
};

const specs = swaggerJsDoc(options);
module.exports = specs;


//added this for auto updated ,, swagger need manual implementation ..