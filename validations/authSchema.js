const Joi = require("joi");

const authSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.base": `Email can be letters or numbers`,
    "string.empty": `Email cannot be an empty field`,
    "string.email": `Email is not valid`,
    "any.required": `Email is a required field`,
  }),

  password: Joi.string().min(8).required().messages({
    "string.base": `Password can be letters or numbers`,
    "string.empty": `Password cannot be an empty field`,
    "string.min": `Password should have a minimum length of {#limit}`,
    "any.required": `Password is a required field`,
  }),
});

module.exports = authSchema;
