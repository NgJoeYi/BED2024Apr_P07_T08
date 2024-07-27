// discussionValidation.js
// Import the Joi validation library
const Joi = require('joi');

// Define the validation schema for a discussion
const discussionSchema = Joi.object({
    title: Joi.string().min(5).required().messages({
        'string.min': 'Title must be at least 5 characters long', // Custom message for minimum length validation
        'any.required': 'Title is required' // Custom message for required field validation
    }),
    category: Joi.string().required().messages({
        'any.required': 'Category is required' // Custom message for required field validation
    }),
    description: Joi.string().min(10).required().messages({
        'string.min': 'Description must be at least 10 characters long', // Custom message for minimum length validation
        'any.required': 'Description is required' // Custom message for required field validation
    })
});

// Function to validate the discussion data in the request body
function validateDiscussion(req, res, next) {
    // Validate the request body against the schema
    const { error } = discussionSchema.validate(req.body, { abortEarly: false }); //abortEarly: false option ensures that all validation errors are collected and not just the first one encountered.
    
    // Check if validation failed
    if (error) {
        // Map the error details to a custom format including the error message and the path to the invalid field
        const errorMessages = error.details.map(err => `${err.message} (path: ${err.path.join(' -> ')})`);
        console.log('Validation failed:', errorMessages); // Alert mechanism: Log validation errors to the console

        // Respond with a 400 Bad Request status and a JSON object containing the validation error messages
        return res.status(400).json({ success: false, errors: errorMessages }); //cannot or will not process the request due to a client error (e.g., malformed request syntax, 
    }
    
    // If validation passed, proceed to the next middleware function
    next();
}

// Export the validateDiscussion function for use in other parts of the application
module.exports = validateDiscussion;
