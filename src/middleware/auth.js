const jwt = require('jsonwebtoken');
const { Usuario } = require('../Models/UsuarioModel');

/**
 * Middleware que autentica y opcionalmente valida roles.
 * @param {Array} rolesPermitidos - Si se pasa, validará que el usuario tenga uno de estos roles.
 */
module.exports = function (rolesPermitidos = []) {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token requerido' });
        }

        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log('Token decodificado:', decoded);

            const usuario = await Usuario.findById(decoded._id);
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            req.usuario = usuario;

            if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
                return res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
            }

            next();
        } catch (err) {
            console.warn('Token inválido:', err.message);
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
    };
};
