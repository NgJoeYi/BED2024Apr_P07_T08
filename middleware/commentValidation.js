const Joi = require('joi');

// Defining schema (set of rules 2 validate comment)
const commentSchema = Joi.object({
    content: Joi.string() // Content must be string
        .trim() // Remove leading and trailing whitespace
        .pattern(/^(?![\p{P}\s]+$).+/u) // Ensure not only punctuation or whitespace
        .max(150) // Maximum length of 150 characters
        .required() // Content is required
        .messages({
            'string.empty': 'Comments cannot be empty.',  // Custom message for empty content
            'string.max': 'Comments cannot exceed 150 words.', // Custom message for exceeding max length
            'string.pattern.base': 'Comments cannot consist solely of punctuations.' // Custom message for only punctuation or whitespace
        }),
    discussionId: Joi.number() // Discussion Id must be number (integer)
        .integer() // Must be an integer
        .required() // Discussion ID is required
        .messages({
            'number.base': 'Discussion ID must be a valid number.', // Custom message for invalid number
            'number.empty': 'Discussion ID is required.' // Custom message for missing discussion ID
        })
});

// Middleware function to validate comment data
function validateComment(req, res, next) {
    const { error } = commentSchema.validate(req.body); // Validating request data against the commentSchema + 'const { error }' is to extract error out from process of 'commentSchema.validate(req.body)'. --> aka destructure (to make code cleaner etc)
    if (error) {
        return res.status(400).json({ error: error.details[0].message }); // Terminate middleware execution on validation error
    }
    next(); // If comment successfully validated, then can move on
}

// Export the middleware function
module.exports = validateComment;
