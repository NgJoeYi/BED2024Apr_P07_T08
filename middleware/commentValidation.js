const Joi = require('joi');

// Defining schema (set of rules 2 validate comment)
const commentSchema = Joi.object({
    content: Joi.string() // Content must be string
        .trim()
        .pattern(/^(?![\p{P}\s]+$).+/u) // Ensure not only punctuation or whitespace
        .max(150)
        .required()
        .messages({
            'string.empty': 'Comments cannot be empty.',
            'string.max': 'Comments cannot exceed 150 words.',
            'string.pattern.base': 'Comments cannot consist solely of punctuations.'
        }),
    discussionId: Joi.number() // Discussion Id must be number (integer)
        .integer()
        .required()
        .messages({
            'number.base': 'Discussion ID must be a valid number.',
            'number.empty': 'Discussion ID is required.'
        })
});

// Middleware
function validateComment(req, res, next) {
    const { error } = commentSchema.validate(req.body); // Validating request data against the commentSchema + 'const { error }' is to extract error out from process of 'commentSchema.validate(req.body)'. --> aka destructure (to make code cleaner etc)
    if (error) {
        return res.status(400).json({ error: error.details[0].message }); // Terminate middleware execution on validation error
    }
    next(); // If comment successfully validated, then can move on
}

module.exports = validateComment;
