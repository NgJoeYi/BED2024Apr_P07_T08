const Joi = require('joi');

const reviewSchema = Joi.object({
    review_text: Joi.string().trim().pattern(/^(?![\p{P}\s]+$).+/u).max(250).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    courseId: Joi.number().integer().required()
});

function validateReview(req, res, next) {
    console.log('Request body:', req.body); // Log the request body
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message); // Log the validation error
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

module.exports = validateReview;
