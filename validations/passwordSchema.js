const Joi = require("joi");

const passwordSchema = Joi.object({
  password: Joi.string().min(8).required().messages({
    "string.base": `Password can be letters or numbers`,
    "string.empty": `Password cannot be an empty field`,
    "string.min": `Password should have a minimum length of {#limit}`,
    "any.required": `Password is a required field`,
  }),
  confirmPassword: Joi.string().min(8).required().messages({
    "string.base": `Confirm Password can be letters or numbers`,
    "string.empty": `Confirm Password cannot be an empty field`,
    "string.min": `Confirm Password should have a minimum length of {#limit}`,
    "any.required": `Confirm Password is a required field`,
  }),
});

module.exports = passwordSchema;
