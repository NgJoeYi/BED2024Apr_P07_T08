const Joi = require("joi");

const updateValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50),
        dob: Joi.date(),
        email: Joi.string().email().max(100),
        currentPassword: Joi.string().min(8).max(255),
        newPassword: Joi.string().min(8).max(255),
        confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).messages({ 'any.only': 'Passwords do not match' })
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        console.log('Validation errors:', errors);
        return res.status(400).json({ message: "Validation error", errors });
    }

    next();
};

module.exports = updateValidation;
