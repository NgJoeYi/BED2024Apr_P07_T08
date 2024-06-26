const Joi = require("joi");

const updateValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        dob: Joi.date().required(),
        email: Joi.string().email().max(100).required(),
        currentPassword: Joi.string().min(8).max(255).required(),
        newPassword: Joi.string().min(8).max(255).required(),
        confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({ 'any.only': 'Passwords do not match' })
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        console.log('Validation errors:', errors);
        return res.status(400).json({ message: "Validation error", errors });
    }

    //console.log('Request body:', req.body);
    next();
};

module.exports = updateValidation;
