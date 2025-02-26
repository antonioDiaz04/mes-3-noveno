const Joi = require("joi");

const validarDatos = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: error.details.map((err) => err.message),
      });
    }

    next();
  };
};

module.exports = validarDatos;
