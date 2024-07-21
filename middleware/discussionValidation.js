// discussionValidation.js
const Joi = require('joi');

const discussionSchema = Joi.object({
    title: Joi.string().min(5).required().messages({
        'string.min': 'Title must be at least 5 characters long',
        'any.required': 'Title is required'
    }),
    category: Joi.string().required().messages({
        'any.required': 'Category is required'
    }),
    description: Joi.string().min(10).required().messages({
        'string.min': 'Description must be at least 10 characters long',
        'any.required': 'Description is required'
    })
});

function validateDiscussion(req, res, next) {
    const { error } = discussionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(err => `${err.message} (path: ${err.path.join(' -> ')})`);
        console.log('Validation failed:', errorMessages); // Alert mechanism
        return res.status(400).json({ success: false, errors: errorMessages });
    }
    next();
}

module.exports = validateDiscussion;
