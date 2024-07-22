const Joi = require('joi');

const reviewSchema = Joi.object({
    review_text: Joi.string()
        .trim()
        .pattern(/^(?![\p{P}\s]+$).+/u)
        .max(250)
        .required()
        .messages({
            'string.empty': 'Reviews cannot be empty.',
            'string.max': 'Reviews cannot exceed 250 words.',
            'string.pattern.base': 'Reviews cannot consist solely of punctuations.'
        }),
    rating: Joi.number() // Rating must be number (integer) ranging from 1 to 5
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'Reviews must have a valid number of stars.',
            'number.min': 'Reviews should have a minimum of 1 star.',
            'number.max': 'Reviews can have a maximum of 5 stars.'
        }),
    courseId: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'Course ID must be a valid number.',
            'number.empty': 'Course ID is required.'
        })
});

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

module.exports = validateReview;
