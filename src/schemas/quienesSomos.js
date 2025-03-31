const Joi = require("joi");

// Esquema para Misión
const misionSchema = Joi.object({
  contenido: Joi.string().required().trim().min(10).max(2000)
    .messages({
      'string.empty': 'El contenido de la misión no puede estar vacío',
      'string.min': 'La misión debe tener al menos {#limit} caracteres',
      'string.max': 'La misión no puede exceder los {#limit} caracteres',
      'any.required': 'El contenido de la misión es requerido'
    }),
  activo: Joi.boolean().default(true)
});

// Esquema para Visión
const visionSchema = Joi.object({
  contenido: Joi.string().required().trim().min(10).max(2000)
    .messages({
      'string.empty': 'El contenido de la visión no puede estar vacío',
      'string.min': 'La visión debe tener al menos {#limit} caracteres',
      'string.max': 'La visión no puede exceder los {#limit} caracteres',
      'any.required': 'El contenido de la visión es requerido'
    }),
  activo: Joi.boolean().default(true)
});

// Esquema para Valores
const valorSchema = Joi.object({
  // nombre: Joi.string().required().trim().min(3).max(100)
  //   .messages({
  //     'string.empty': 'El nombre del valor no puede estar vacío',
  //     'string.min': 'El nombre debe tener al menos {#limit} caracteres',
  //     'string.max': 'El nombre no puede exceder los {#limit} caracteres',
  //     'any.required': 'El nombre del valor es requerido'
  //   }),
  // descripcion: Joi.string().required().trim().min(10).max(500)
  //   .messages({
  //     'string.empty': 'La descripción no puede estar vacía',
  //     'string.min': 'La descripción debe tener al menos {#limit} caracteres',
  //     'string.max': 'La descripción no puede exceder los {#limit} caracteres',
  //     'any.required': 'La descripción es requerida'
  //   }),
  // icono: Joi.string().trim().max(50)
  //   .messages({
  //     'string.max': 'El icono no puede exceder los {#limit} caracteres'
  //   }),
  // orden: Joi.number().integer().min(0).default(0),
  // activo: Joi.boolean().default(true)
});

// Esquema para Preguntas Frecuentes
const preguntaFrecuenteSchema = Joi.object({
  pregunta: Joi.string().required().trim().min(10).max(200)
    .messages({
      'string.empty': 'La pregunta no puede estar vacía',
      'string.min': 'La pregunta debe tener al menos {#limit} caracteres',
      'string.max': 'La pregunta no puede exceder los {#limit} caracteres',
      'any.required': 'La pregunta es requerida'
    }),
  respuesta: Joi.string().required().trim().min(10).max(2000)
    .messages({
      'string.empty': 'La respuesta no puede estar vacía',
      'string.min': 'La respuesta debe tener al menos {#limit} caracteres',
      'string.max': 'La respuesta no puede exceder los {#limit} caracteres',
      'any.required': 'La respuesta es requerida'
    }),
  categoria: Joi.string().trim().max(50)
    .messages({
      'string.max': 'La categoría no puede exceder los {#limit} caracteres'
    }),
  orden: Joi.number().integer().min(0).default(0),
  activo: Joi.boolean().default(true)
});

// Esquema para query params de Preguntas Frecuentes
const preguntasQuerySchema = Joi.object({
  categoria: Joi.string().trim().max(50)
});

// Esquema para IDs de MongoDB
const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'El ID proporcionado no es válido'
  });

module.exports = {
  misionSchema,
  visionSchema,
  valorSchema,
  preguntaFrecuenteSchema,
  preguntasQuerySchema,
  objectIdSchema,

};