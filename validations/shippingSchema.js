const Joi = require("joi");

const shippingSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/)
    .required()
    .messages({
      "string.base": `First name can only be latin letters`,
      "string.empty": `First name cannot be an empty field`,
      "string.min": `First name should have a minimum length of {#limit}`,
      "string.max": `First name can be a maximum length of {#limit}`,
      "any.required": `First name is a required field`,
    }),
  middle_name: Joi.string()
    .allow("")
    .max(30)
    .pattern(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/)
    .messages({
      "string.base": `Middle name can only be latin letters`,
      "string.min": `Middle name should have a minimum length of {#limit}`,
      "string.max": `Middle name can be a maximum length of {#limit}`,
    }),
  last_name: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/)
    .required()
    .messages({
      "string.base": `Last name can only be latin letters`,
      "string.empty": `Last name cannot be an empty field`,
      "string.min": `Last name should have a minimum length of {#limit}`,
      "string.max": `Last name can be a maximum length of {#limit}`,
      "any.required": `Last name is a required field`,
    }),

  country: Joi.string().required(),
  region: Joi.string().required(),

  city: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/)
    .required()
    .messages({
      "string.base": `City name can only be latin letters`,
      "string.empty": `City name cannot be an empty field`,
      "string.min": `City name should have a minimum length of {#limit}`,
      "string.max": `City name can be a maximum length of {#limit}`,
      "any.required": `City name is a required field`,
    }),

  address_line_1: Joi.string()
    .min(3)
    .max(128)
    .pattern(/[&/\\+()$~%^'":*?<>{}]/, { invert: true })
    .required()
    .messages({
      "string.base": `Address cannot contain special characters`,
      "string.empty": `Address cannot be an empty field`,
      "string.min": `Address should have a minimum length of {#limit}`,
      "string.max": `Address can be a maximum length of {#limit}`,
      "any.required": `Address is a required field`,
    }),
  address_line_2: Joi.string()
    .allow("")
    .max(128)
    .pattern(/[&/\\+()$~%^'":*?<>{}]/, { invert: true })
    .messages({
      "string.base": `Address cannot contain special characters`,
      "string.min": `Address should have a minimum length of {#limit}`,
      "string.max": `Address can be a maximum length of {#limit}`,
    }),
  postal_code: Joi.string()
    .min(3)
    .max(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": `Postal code can only be numbers`,
      "string.empty": `Postal code cannot be an empty field`,
      "string.min": `Postal code should have a minimum length of {#limit}`,
      "string.max": `Postal code can be a maximum length of {#limit}`,
      "any.required": `Postal code is a required field`,
    }),
});

module.exports = shippingSchema;
