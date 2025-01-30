const Renta = require("../Models/RentaModel");
const Producto = require("../Models/ProductModel");

// Crear Nueva Renta desde Frontend
exports.crearRenta = async (req, res) => {
  try {
    // Datos recibidos directamente del frontend
    const { 
      usuarioId,
      productoId, 
      fechaInicio, 
      fechaFin, 
      metodoPago,
      precioRenta
    } = req.body;

    // Validar producto
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ 
        mensaje: 'Producto no encontrado' 
      });
    }

    // Crear nueva renta
    const nuevaRenta = new Renta({
      usuario: usuarioId,
      producto: productoId,
      detallesRenta: {
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        duracionDias: calcularDiasDiferencia(fechaInicio, fechaFin)
      },
      detallesPago: {
        precioRenta: precioRenta,
        metodoPago: metodoPago
      },
      estado: 'Activo'
    });

    // Guardar renta
    const rentaGuardada = await nuevaRenta.save();
    
    // Actualizar disponibilidad del producto
    await Producto.findByIdAndUpdate(productoId, {
      $set: { disponibleParaRenta: false }
    });

    res.status(201).json({
      mensaje: 'Renta creada exitosamente',
      renta: rentaGuardada
    });

  } catch (error) {
    console.error('Error en creación de renta:', error);
    res.status(500).json({
      mensaje: 'Error al crear renta',
      error: error.message
    });
  }
};

// Listar Rentas de un Usuario Específico
exports.listarRentasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const rentasUsuario = await Renta.find({ 
      usuario: usuarioId 
    })
    .populate('producto', 'nombre imagenPrincipal precio')
    .sort({ createdAt: -1 });

    res.status(200).json({
      total: rentasUsuario.length,
      rentas: rentasUsuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar rentas',
      error: error.message
    });
  }
};

// Cancelar Renta
exports.cancelarRenta = async (req, res) => {
  try {
    const { rentaId } = req.params;
    const { usuarioId } = req.body;

    const renta = await Renta.findById(rentaId);
    if (!renta) {
      return res.status(404).json({
        mensaje: 'Renta no encontrada'
      });
    }

    // Verificar si el usuario puede cancelar
    if (renta.usuario.toString() !== usuarioId) {
      return res.status(403).json({
        mensaje: 'No autorizado para cancelar esta renta'
      });
    }

    // Actualizar estado
    renta.estado = 'Cancelado';
    await renta.save();

    // Liberar producto
    await Producto.findByIdAndUpdate(renta.producto, {
      $set: { disponibleParaRenta: true }
    });

    res.status(200).json({
      mensaje: 'Renta cancelada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al cancelar renta',
      error: error.message
    });
  }
};

// Función para calcular días de diferencia
function calcularDiasDiferencia(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferenciaTiempo = Math.abs(fin - inicio);
  return Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
}

module.exports = {
  crearRenta,
  listarRentasUsuario,
  cancelarRenta
};
