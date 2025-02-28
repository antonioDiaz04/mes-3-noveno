const Joi = require("joi");

const crearPerfilEmpresaSchema = Joi.object({
  redesSociales: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  slogan: Joi.string().max(200).optional(),
  tituloPagina: Joi.string().max(100).optional(),
  direccion: Joi.string().min(5).max(255).required(),
  correoElectronico: Joi.string()
    .email()
    .pattern(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|info|biz|mx|us|uk|es|fr|de|ca|au|jp|xyz|me|tech|co|tv|cloud|ai)$/
    )
    .optional(),
  telefono: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
});

module.exports = { crearPerfilEmpresaSchema };
