const Joi = require("joi");

const tokenSchema = Joi.object({
  token: Joi.string().hex().messages({
    "string.base": `Invalid token. Please try again.`,
    "string.empty": `Token cannot be an empty field.`,
  }),
});

module.exports = tokenSchema;
