const Joi = require('joi');

const commentSchema = Joi.object({
    content: Joi.string()
        .trim()
        .pattern(/^(?![\p{P}\s]+$).+/u)
        .max(150)
        .required()
        .messages({
            'string.empty': 'Comments cannot be empty.',
            'string.max': 'Comments cannot exceed 150 words.',
            'string.pattern.base': 'Comments cannot consist solely of punctuations.'
        }),
    discussionId: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'Discussion ID must be a valid number.',
            'number.empty': 'Discussion ID is required.'
        })
});

function validateComment(req, res, next) {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

module.exports = validateComment;
