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
    