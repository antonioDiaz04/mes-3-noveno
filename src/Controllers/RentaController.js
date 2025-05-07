const Renta = require("../Models/RentaModel");
const Producto = require("../Models/ProductModel");
const { enviarNotificacion } = require("../util/webpush");
const { logger } = require("../util/logger");

// Crear Nueva Renta desde Frontend
const crearRenta = async (req, res) => {
  try {
    const {
      usuarioId,
      productoId,
      fechaInicio,
      fechaFin,
      metodoPago,
      precioRenta
    } = req.body;

    // Validar si los campos requeridos están presentes
    if (!usuarioId || !productoId || !fechaInicio || !fechaFin || !metodoPago || !precioRenta) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si el producto existe
    const producto = await Producto.findById(productoId);
    if (!producto) {
      logger.warn(`Producto con ID ${productoId} no encontrado`);
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      return res.status(400).json({ mensaje: 'La fecha de fin debe ser posterior a la fecha de inicio' });
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

    // Guardar la renta y actualizar el producto
    const rentaGuardada = await nuevaRenta.save();
    await Producto.findByIdAndUpdate(productoId, { $set: { disponibleParaRenta: false } });

    if (token) {
      await enviarNotificacion(token, 'Renta creada', 'Tu renta ha sido procesada con éxito.');
    }

    logger.info(`Renta creada con éxito para el producto ${productoId}`);
    res.status(201).json({ mensaje: 'Renta creada exitosamente', renta: rentaGuardada });
  } catch (error) {
    logger.error('Error en creación de renta:', error);
    res.status(500).json({ mensaje: 'Error al crear renta', error: error.message });
  }
};

const listarRentasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Validar que el usuarioId esté presente
    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'El usuarioId es obligatorio' });
    }

    const rentasUsuario = await Renta.find({ usuario: usuarioId })
      .populate('producto', 'nombre imagenPrincipal precio')
      .sort({ createdAt: -1 });

    logger.info(`Se encontraron ${rentasUsuario.length} rentas para el usuario ${usuarioId}`);
    res.status(200).json({ total: rentasUsuario.length, rentas: rentasUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar rentas', error: error.message });
  }
};


// Cancelar Renta
const cancelarRenta = async (req, res) => {
  try {
    const { rentaId, token } = req.body;
    const { usuarioId } = req.body;

    const renta = await Renta.findById(rentaId);
    if (!renta) {
      logger.warn(`Renta con ID ${rentaId} no encontrada`);
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    if (renta.usuario.toString() !== usuarioId) {
      logger.warn(`Usuario ${usuarioId} no autorizado para cancelar la renta ${rentaId}`);
      return res.status(403).json({ mensaje: 'No autorizado para cancelar esta renta' });
    }

    renta.estado = 'Cancelado';
    await renta.save();
    await Producto.findByIdAndUpdate(renta.producto, { $set: { disponibleParaRenta: true } });

    if (token) {
      await enviarNotificacion(token, 'Renta cancelada', 'Tu renta ha sido cancelada.');
    }

    logger.info(`Renta con ID ${rentaId} cancelada exitosamente por el usuario ${usuarioId}`);
    res.status(200).json({ mensaje: 'Renta cancelada exitosamente' });
  } catch (error) {
    logger.error('Error al cancelar renta:', error);
    res.status(500).json({ mensaje: 'Error al cancelar renta', error: error.message });
  }
};

// Función para calcular días de diferencia
function calcularDiasDiferencia(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    logger.error('Error en las fechas proporcionadas para el cálculo de días');
    return 0; // Retorna 0 si hay un error en las fechas
  }

  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
}


const obtenerProductosRentadosByIdUser = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Obtener las rentas asociadas a un usuario
    const productosRentados = await Renta.find({ usuario: usuarioId })
      .populate('producto', 'nombre precio imagenPrincipal')  // Populate para obtener detalles del producto
      .sort({ createdAt: -1 }); // Ordenar por la fecha de la renta (más recientes primero)

    res.status(200).json(productosRentados);
  } catch (error) {
    console.error('Error al obtener productos rentados:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos rentados', error: error.message });
  }
};

const elimininarById = async (req, res) => {
  try {
    const { id } = req.params;
    const rentaEliminada = await Renta.findByIdAndDelete(id);

    if (!rentaEliminada) {
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    // Actualizar el estado del producto a disponible
    await Producto.findByIdAndUpdate(rentaEliminada.producto, { $set: { disponibleParaRenta: true } });

    res.status(200).json({ mensaje: 'Renta eliminada exitosamente', rentaEliminada });
  } catch (error) {
    console.error('Error al eliminar la renta:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la renta', error: error.message });
  }
}
const obtenerRentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const renta = await Renta.findById(id)
      .populate('producto', 'nombre precio imagenPrincipal'); // Poblar la información del producto

    if (!renta) {
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    res.status(200).json(renta);
  } catch (error) {
    console.error('Error al obtener la renta:', error);
    res.status(500).json({ mensaje: 'Error al obtener la renta', error: error.message });
  }
}
const eliminarRentasSeleccionadas = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ mensaje: 'IDs inválidos' });
    }
    const rentasEliminadas = await Renta.deleteMany({ _id: { $in: ids } });
    if (rentasEliminadas.deletedCount === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron rentas para eliminar' });
    }
    res.status(200).json({ mensaje: 'Rentas eliminadas exitosamente', rentasEliminadas });
  } catch (error) {
    console.error('Error al eliminar las rentas:', error);
    res.status(500).json({ mensaje: 'Error al eliminar las rentas', error: error.message });
  }
}






// const obtenerRentaByIdUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const renta = await Renta.find({ usuario: id })
//       .populate('producto', 'nombre precio imagenPrincipal'); // Poblar la información del producto

//     if (!renta) {
//       return res.status(404).json({ mensaje: 'Renta no encontrada' });
//     }

//     res.status(200).json(renta);
//   } catch (error) {
//     console.error('Error al obtener la renta:', error);
//     res.status(500).json({ mensaje: 'Error al obtener la renta', error: error.message });
//   }
// }
const obtenerRentaByIdProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const renta = await Renta.find({ producto: id })
      .populate('usuario', 'nombre imagenPrincipal'); // Poblar la información del usuario

    if (!renta) {
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    res.status(200).json(renta);
  } catch (error) {
    console.error('Error al obtener la renta:', error);
    res.status(500).json({ mensaje: 'Error al obtener la renta', error: error.message });
  }
}
const obtenerRentaByIdEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const renta = await Renta.find({ estado: id })
      .populate('usuario', 'nombre imagenPrincipal'); // Poblar la información del usuario

    if (!renta) {
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    res.status(200).json(renta);
  } catch (error) {
    console.error('Error al obtener la renta:', error);
    res.status(500).json({ mensaje: 'Error al obtener la renta', error: error.message });
  }
}
const actualizarRentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // Obtener el nuevo estado de la renta desde el cuerpo de la solicitud

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['Activo', 'Cancelado', 'Finalizado'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    // Actualizar la renta
    const rentaActualizada = await Renta.findByIdAndUpdate(id, { estado }, { new: true })
      .populate('producto', 'nombre precio imagenPrincipal'); // Poblar la información del producto

    if (!rentaActualizada) {
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    res.status(200).json(rentaActualizada);
  } catch (error) {
    console.error('Error al actualizar la renta:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la renta', error: error.message });
  }
}


// Función para obtener todas las rentas
const obtenerRentas = async (req, res) => {
  try {
    // Obtener todas las rentas sin filtro por usuario
    const rentas = await Renta.find({})
      .populate('producto', 'nombre imagenPrincipal categoria precio') // Poblar la información del producto
      .sort({ fechaDeRegistro: -1 }); // Ordenar las rentas por fecha de registro

    // Retornar las rentas
    res.status(200).json({
      rentas,
    });
  } catch (error) {
    console.error('Error al obtener rentas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener rentas',
      error: error.message,
    });
  }
};
module.exports = { eliminarRentasSeleccionadas,obtenerRentaById,obtenerRentaByIdEstado, actualizarRentaById, obtenerRentaByIdProducto, elimininarById, obtenerRentas, obtenerProductosRentadosByIdUser, crearRenta, listarRentasUsuario, cancelarRenta };
