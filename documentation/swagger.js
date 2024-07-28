const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; // Output file for the spec
const routes = ["../app.js"]; // Path to your API route files

const doc = {
  info: {
    title: "EduHelper.",
    description: "Unlocking potential, one lesson at a time",
  },
  host: "localhost:3000", // Replace with your actual host if needed
};

swaggerAutogen(outputFile, routes, doc);