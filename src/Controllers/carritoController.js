const Carrito = require('../Models/Carrito');

exports.guardarCarrito = async (req, res) => {
  try {
    const usuarioId = req.usuario._id; // requiere autenticación previa
    const { productos } = req.body;

    if (!productos || !productos.length) {
      return res.status(400).json({ mensaje: 'No se enviaron productos' });
    }

    // Elimina carrito anterior (si existe)
    await Carrito.findOneAndDelete({ usuarioId });

    // Guarda nuevo carrito
    const nuevoCarrito = new Carrito({ usuarioId, productos });
    await nuevoCarrito.save();

    res.status(200).json({ mensaje: 'Carrito guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar carrito:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.vaciarCarrito = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;
    await Carrito.findOneAndDelete({ usuarioId });
    res.status(200).json({ mensaje: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
