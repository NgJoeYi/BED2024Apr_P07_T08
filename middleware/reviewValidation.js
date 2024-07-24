const Joi = require('joi'); // Importing Joi for validation

// Define the schema for validating a review
const reviewSchema = Joi.object({
    review_text: Joi.string() // Review text must be a string
        .trim() // Remove leading and trailing whitespace
        .pattern(/^(?![\p{P}\s]+$).+/u) /// Ensure not only punctuation
        .max(250) // Maximum length of 250 characters
        .required() // Required field
        .messages({
            // Custom messages
            'string.empty': 'Reviews cannot be empty.',
            'string.max': 'Reviews cannot exceed 250 words.',
            'string.pattern.base': 'Reviews cannot consist solely of punctuations.'
        }),
    rating: Joi.number() // Rating must be number (integer) ranging from 1 to 5
        .integer()
        .min(1)
        .max(5)
        .required() // Required field
        .messages({
            // Custom messages
            'number.base': 'Reviews must have a valid number of stars.',
            'number.min': 'Reviews should have a minimum of 1 star.',
            'number.max': 'Reviews can have a maximum of 5 stars.'
        }),
    courseId: Joi.number() // Course ID must be a number (integer)
        .integer()
        .required() // Required field
        .messages({
            // Custom messages
            'number.base': 'Course ID must be a valid number.',
            'number.empty': 'Course ID is required.'
        })
});

// Middleware function to validate the review
function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body); // Validate request body against the schema
    if (error) {
        return res.status(400).json({ error: error.details[0].message }); // Return error message if validation fails
    }
    next(); // Otherwise, proceed to the next middleware if validation passes
}

module.exports = validateReview; // Export the validation function
