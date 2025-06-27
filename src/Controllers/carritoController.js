const Carrito = require('../Models/Carrito');

// GET /api/carrito/byIdUsuario/:idUsuario
exports.obtenerCarrito = async (req, res) => {
  try {
    const usuarioId = req.params.idUsuario;
    const carrito = await Carrito.findOne({ usuarioId });
    res.json(carrito || {});
  } catch (error) {
    console.error("❌ Error al obtener carrito", error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
};

// POST /api/carrito/guardar
exports.guardarCarrito = async (req, res) => {
  try {
    const { usuarioId, productos } = req.body;

    if (!usuarioId || !productos || !productos.length) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }

    await Carrito.findOneAndDelete({ usuarioId });

    const nuevoCarrito = new Carrito({ usuarioId, productos });
    await nuevoCarrito.save();

    res.status(200).json({ mensaje: 'Carrito guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar carrito:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// DELETE /api/carrito/vaciar/:idUsuario
exports.vaciarCarrito = async (req, res) => {
  try {
    const usuarioId = req.params.idUsuario;
    await Carrito.findOneAndDelete({ usuarioId });
    res.status(200).json({ mensaje: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// DELETE /api/carrito/eliminar/:idUsuario/:idProducto
exports.eliminarProducto = async (req, res) => {
  try {
    const usuarioId = req.params.idUsuario;
    const idProducto = req.params.idProducto;

    const carrito = await Carrito.findOne({ usuarioId });
    if (!carrito) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    carrito.productos = carrito.productos.filter(
      (producto) => producto._id.toString() !== idProducto
    );
    await carrito.save();

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar producto", error);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
};
