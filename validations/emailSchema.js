const Joi = require("joi");

const emailSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.base": `Email can be letters or numbers`,
    "string.empty": `Email cannot be an empty field`,
    "string.email": `Email is not valid`,
    "any.required": `Email is a required field`,
  }),
});

module.exports = emailSchema;
