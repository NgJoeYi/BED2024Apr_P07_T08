const Joi = require("joi");

// rmb check database schema to match!!!!!!!!!!!!!!!!
const validateUser = (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
      dob: Joi.date().required(),
      email: Joi.string().email().max(100).required(),
      password: Joi.string().min(8).max(255).required(),
      role: Joi.string().valid('student', 'lecturer').required()
    });

  const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

module.exports = validateUser;
