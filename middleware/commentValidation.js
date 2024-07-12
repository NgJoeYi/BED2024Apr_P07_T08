const Joi = require('joi');

const commentSchema = Joi.object({
    content: Joi.string().trim().pattern(/^[^\s]+(\s+[^\s]+)*$/).max(150).required(),
    discussionId: Joi.number().integer().required()
});

function validateComment(req, res, next) {
    console.log('Request body:', req.body); // Log the request body
    const { error } = commentSchema.validate(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message); // Log the validation error
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

module.exports = validateComment;
