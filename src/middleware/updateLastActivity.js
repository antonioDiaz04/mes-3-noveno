const { Usuario } = require("../Models/UsuarioModel"); 

module.exports = async function updateLastActivity(req, res, next) {
  try {
    if (req.usuario && req.usuario._id) {
      await Usuario.findByIdAndUpdate(req.usuario._id, {
        ultimaConexion: new Date(),
      });
    }
  } catch (error) {
    console.error("Error al actualizar ultimaConexion:", error.message);
  }
  next();
};
