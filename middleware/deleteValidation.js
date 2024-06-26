const Joi = require("joi");

const deleteValidation = (req, res, next) => {
    const schema = Joi.object({
        //email: Joi.string().email().max(100).required(),
        password: Joi.string().min(8).max(255).required()
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

module.exports = deleteValidation;
