const Joi = require("joi");

const feedbackSchema = Joi.object({
  text: Joi.string().normalize().max(1024).messages({
    "string.base": `Feedback message can be only normalized unicode.`,
    "string.max": `Feedback message can be maximum of {#limit} characters.`,
  }),

  rating: Joi.number().min(1).max(5).required().messages({
    "number.min": `Rating minimum value is {#limit}`,
    "number.max": `Rating maximum value is {#limit}`,
    "any.required": `Rating is a required.`,
  }),
});

module.exports = feedbackSchema;
