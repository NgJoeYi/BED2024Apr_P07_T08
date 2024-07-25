
const Joi = require("joi");

const validateCreateQuiz = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    total_questions: Joi.number().integer().required(),
    total_marks: Joi.number().integer().required(),
    // created_by: Joi.number().integer().required(),
    quizImg: Joi.string().base64().required(), // Require quizImg
    });

const validation = schema.validate(req.body, { abortEarly: false });


if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    console.log('Validation errors:', errors); // Log the validation errors to the console
    res.status(400).json({ message: "Validation error", errors });
    return;
}

next();
};

// rmb check database schema to match!!!!!!!!!!!!!!!!
const validateCreateQuestion = (req, res, next) => {
  const schema = Joi.object({
      quiz_id: Joi.number().integer().required(),
      question_text: Joi.string().required(),
      option_1: Joi.string().required(),
      option_2: Joi.string().required(),
      option_3: Joi.string().required(),
      option_4: Joi.string().required(),
      correct_option: Joi.number().integer().min(1).max(4).required(),
      qnsImg: Joi.string().base64().allow('', null).optional(), // Allow empty string, null, or base64 string
  });

  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    console.log('Validation errors:', errors); // Log the validation errors to the console
    res.status(400).json({ message: "Validation error", errors });
    return;
}

  next();
};

const validateUpdateQuiz = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    total_questions: Joi.number().integer().required(),
    total_marks: Joi.number().integer().required(),
    quizImg: Joi.string().base64().allow(null, ''), // can be null or empty cos in controller i will reassign the current image. because when the edit modal pops up, the field is empty and not prefilled with the image
  }).unknown(true); // unknown fields can pass through

  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    console.log('Validation errors:', errors); // Log the validation errors to the console
    res.status(400).json({ message: "Validation error", errors });
    return;
  }

  next();
};

module.exports = {
  validateCreateQuestion,
  validateCreateQuiz,
  validateUpdateQuiz
};
// note: 
// - joi.ref is used to create a reference to another key in the same schema. so in this case,
// I am trying to make sure that correct option is in either options 1,2,3, or 4.

// - custom is for custom validation logic. can be done in controller to but i think more efficient to check here before sending it
// to controller.