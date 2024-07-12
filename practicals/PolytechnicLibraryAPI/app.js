require('dotenv').config(); 
const express = require('express'); 
const sql = require('mssql'); 
const bodyParser = require('body-parser'); 
const dbConfig = require('./dbConfig'); 
const userController = require('./controller/userController'); 
const bookController = require('./controller/bookController'); 
const jwtAuthorization = require('./middleware/authMiddleware'); 
const swaggerUi = require("swagger-ui-express"); 
const swaggerDocument = require("./swagger-output.json"); // Import generated spec 
 
const app = express(); 
const port = process.env.PORT || 3000; // Use environment variable/default port 
 
// Include body-parser middleware to handle JSON data 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
 
// Serve the Swagger UI at a specific route 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // so in search bar type: localhost:3000/api-docs 
 
// Members (library members) 
app.post('/register', userController.createUser); 
app.post('/login', userController.login); 
 
// Librarians 
app.post('/register', userController.createUser); 
app.post('/login', userController.login); 
// app.put('/books/:bookdId/availability', jwtAuthorization, bookController.updateBookAvailability); 
 
// For both member and librarians 
// app.put('/books/:bookId/availability', jwtAuthorization, bookController.updateBookAvailability); 
 
 
app.listen(port, async () => { 
    try { 
        // Connect to the database 
        await sql.connect(dbConfig); 
        console.log("Database connection established successfully"); 
    } catch (err) { 
        console.error("Database connection error:", err); 
        // Terminate the application with an error code (optional) 
        process.exit(1); // Exit with code 1 indicating an error 
    } 
 
    console.log(`Server listening on port ${port}`); 
}); 
 
// Close the connection pool on SIGINT signal 
process.on("SIGINT", async () => { 
    console.log("Server is gracefully shutting down"); 
    // Perform cleanup tasks (e.g., close database connections) 
    await sql.close(); 
    console.log("Database connection closed"); 
    process.exit(0); // Exit with code 0 indicating successful shutdown 
});