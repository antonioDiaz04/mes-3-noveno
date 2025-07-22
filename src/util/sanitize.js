// sanitize.js
const sanitizeHtml = require('sanitize-html');

/**
 * Función para sanitizar objetos.
 * @param {Object} obj - El objeto a sanitizar.
 * @returns {Object} - El objeto sanitizado.
 */
const sanitizeObject = (obj) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeHtml(obj[key]);
    }
  });
  return obj;
};

// Exportar la función
module.exports = sanitizeObject;


// const sanitizeHtml = require('sanitize-html');

// /**
//  * Elimina espacios, etiquetas peligrosas y entidades HTML.
//  */
// const sanitizeString = (value) => {
//   if (Array.isArray(value)) value = value.find(v => v && v.trim() !== '');
//   if (typeof value === 'string') {
//     return sanitizeHtml(value.trim());
//   }
//   return value;
// };

/**
 * Convierte un valor a número (seguro).
 */
// const parseNumber = (value) => {
//   if (Array.isArray(value)) value = value.find(v => v && v.trim() !== '');
//   if (typeof value === 'string') value = value.trim();
//   const num = Number(value);
//   return isNaN(num) ? undefined : num;
// };

/**
 * Convierte string/checkbox a boolean.
 */
// const parseBoolean = (value) => {
//   if (Array.isArray(value)) value = value.find(v => v && v.trim() !== '');
//   return value === 'true' || value === true;
// };

// /**
//  * Sanitiza un objeto completo con reglas por campo
//  */
// const sanitizeObject = (obj) => {
//   const sanitized = {};

//   for (const key in obj) {
//     const value = obj[key];

//     // Casteo por tipo específico
//     if (['altura', 'cintura', 'precioAnterior', 'precioActual'].includes(key)) {
//       sanitized[key] = parseNumber(value);
//     } else if (['nuevo', 'disponible', 'mostrarPrecioAnterior'].includes(key)) {
//       sanitized[key] = parseBoolean(value);
//     } else if (typeof value === 'string' || Array.isArray(value)) {
//       sanitized[key] = sanitizeString(value);
//     } else {
//       sanitized[key] = value;
//     }
//   }

//   return sanitized;
// };

// // ✅ Exportar todo reutilizable
// module.exports = {
//   sanitizeString,
//   parseNumber,
//   parseBoolean,
//   sanitizeObject
// };
