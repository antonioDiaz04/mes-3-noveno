const Renta = require("../Models/RentaModel");
const Producto = require("../Models/ProductModel");
const { enviarNotificacion } = require("../util/webpush");
const {logger} = require("../util/logger");

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
      // logger.warn(`Producto con ID ${productoId} no encontrado`);
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

    // logger.info(`Renta creada con éxito para el producto ${productoId}`);
    res.status(201).json({ mensaje: 'Renta creada exitosamente', renta: rentaGuardada });
  } catch (error) {
    // logger.error('Error en creación de renta:', error);
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

    // logger.info(`Se encontraron ${rentasUsuario.length} rentas para el usuario ${usuarioId}`);
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
      // logger.warn(`Renta con ID ${rentaId} no encontrada`);
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    if (renta.usuario.toString() !== usuarioId) {
      // logger.warn(`Usuario ${usuarioId} no autorizado para cancelar la renta ${rentaId}`);
      return res.status(403).json({ mensaje: 'No autorizado para cancelar esta renta' });
    }

    renta.estado = 'Cancelado';
    await renta.save();
    await Producto.findByIdAndUpdate(renta.producto, { $set: { disponibleParaRenta: true } });

    if (token) {
      await enviarNotificacion(token, 'Renta cancelada', 'Tu renta ha sido cancelada.');
    }

    // logger.info(`Renta con ID ${rentaId} cancelada exitosamente por el usuario ${usuarioId}`);
    res.status(200).json({ mensaje: 'Renta cancelada exitosamente' });
  } catch (error) {
    // logger.error('Error al cancelar renta:', error);
    res.status(500).json({ mensaje: 'Error al cancelar renta', error: error.message });
  }
};

// Función para calcular días de diferencia
function calcularDiasDiferencia(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    // logger.error('Error en las fechas proporcionadas para el cálculo de días');
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

const obtenerRentas = async (req, res) => {
  try {
    // Obtener todas las rentas con populate anidado
    const rentas = await Renta.find({})
      .populate('usuario', 'nombre email')
      .populate({
        path: 'producto',
        select: 'nombre precio idCategoria imagenes', // Incluye idCategoria
        populate: { // Populate anidado para la categoría
          path: 'idCategoria',
          select: 'nombre' // Selecciona solo el nombre de la categoría
        }
      })
      .sort({ fechaDeRegistro: -1 });

    res.status(200).json({ rentas });
  } catch (error) {
    console.error('Error al obtener rentas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener rentas',
      error: error.message,
    });
  }

};

// 
const generarEstadisticasRentas = async (req, res) => {
  try {
    // Obtener todas las rentas completadas con la información de categoría
    const rentas = await Renta.find({ estado: 'Completado' })
      .populate({
        path: 'producto',
        select: 'idCategoria',
        populate: {
          path: 'idCategoria',
          select: 'nombre'
        }
      });

    // Definir períodos (1-15 y 16-final de mes)
    const periodos = [
      { nombre: '1-15', diaInicio: 1, diaFin: 15 },
      { nombre: '16-final', diaInicio: 16, diaFin: 31 }
    ];

    // Obtener todas las categorías únicas
    const categoriasUnicas = [];
    rentas.forEach(renta => {
      if (renta.producto && renta.producto.idCategoria) {
        const existe = categoriasUnicas.some(cat => 
          cat._id.equals(renta.producto.idCategoria._id)
        );
        if (!existe) {
          categoriasUnicas.push(renta.producto.idCategoria);
        }
      }
    });

    // Objeto para acumular totales por categoría
    const totalesCategoria = {};
    categoriasUnicas.forEach(categoria => {
      totalesCategoria[categoria._id] = {
        categoria: categoria.nombre,
        total: 0
      };
    });

    // Generar estadísticas
    const estadisticas = [];
    const meses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Enero (0) a Diciembre (11)

    meses.forEach(mes => {
      periodos.forEach(periodo => {
        categoriasUnicas.forEach(categoria => {
          // Filtrar rentas por mes, período y categoría
          const rentasFiltradas = rentas.filter(renta => {
            if (!renta.producto || !renta.producto.idCategoria) return false;
            
            const fecha = new Date(renta.detallesRenta.fechaInicio);
            const dia = fecha.getDate();
            const mesRenta = fecha.getMonth();
            
            return (
              mesRenta === mes &&
              dia >= periodo.diaInicio && 
              dia <= periodo.diaFin &&
              renta.producto.idCategoria._id.equals(categoria._id)
            );
          });

          // Acumular al total de la categoría
          totalesCategoria[categoria._id].total += rentasFiltradas.length;

          // Calcular incremento (comparar con período anterior)
          let incremento = 0;
          if (mes > 0 || periodo.nombre === '16-final') {
            const periodoAnterior = periodo.nombre === '1-15' ? 
              { nombre: '16-final', mes: mes - 1 } : 
              { nombre: '1-15', mes: mes };
            
            const rentasAnteriores = rentas.filter(renta => {
              if (!renta.producto || !renta.producto.idCategoria) return false;
              
              const fecha = new Date(renta.detallesRenta.fechaInicio);
              const dia = fecha.getDate();
              const mesRenta = fecha.getMonth();
              
              return (
                mesRenta === periodoAnterior.mes &&
                ((periodoAnterior.nombre === '1-15' && dia >= 1 && dia <= 15) ||
                 (periodoAnterior.nombre === '16-final' && dia >= 16 && dia <= 31)) &&
                renta.producto.idCategoria._id.equals(categoria._id)
              );
            });

            const totalAnterior = rentasAnteriores.length;
            const totalActual = rentasFiltradas.length;
            
            if (totalAnterior > 0) {
              incremento = ((totalActual - totalAnterior) / totalAnterior) * 100;
            }
          }

          estadisticas.push({
            idCategoria: categoria._id,
            categoria: categoria.nombre,
            Total_rentas_completadas: rentasFiltradas.length,
            Estadorenta: 'Completo',
            Periodo: new Date(2025, mes, periodo.nombre === '1-15' ? 1 : 16),
            incremento: parseFloat(incremento.toFixed(2)), // 2 decimales
            // Mantenemos los datos por período
            mes,
            periodo: periodo.nombre
          });
        });
      });
    });

    // Convertir totales a array
    const totalesPorCategoria = Object.values(totalesCategoria);

    res.status(200).json({
      estadisticasPorPeriodo: estadisticas,
      totalesPorCategoria,
      // También puedes incluir un resumen general
      resumen: {
        totalRentas: rentas.length,
        categorias: categoriasUnicas.length,
        periodoAnalizado: `${meses.length} meses`
      }
    });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    res.status(500).json({
      mensaje: 'Error al generar estadísticas',
      error: error.message
    });
  }
};



const editarRenta = async (req, res) => {
  try {
    const { rentaId } = req.params;
    const { 
      usuarioId, 
      productoId, 
      fechaInicio, 
      fechaFin, 
      metodoPago, 
      precioRenta,
      estado // Nuevo campo para el estado
    } = req.body;

    // Validar campos requeridos
    if (!usuarioId || !productoId || !fechaInicio || !fechaFin || !metodoPago || !precioRenta || !estado) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['Pendiente', 'Activo', 'Completado', 'Cancelado'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ 
        mensaje: "Estado no válido",
        estadosPermitidos: estadosPermitidos
      });
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      return res.status(400).json({ mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" });
    }

    // Actualizar la renta incluyendo el estado
    const rentaActualizada = await Renta.findByIdAndUpdate(
      rentaId,
      {
        usuario: usuarioId,
        producto: productoId,
        estado, // Incluir el estado en la actualización
        detallesRenta: {
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          duracionDias: Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)),
        },
        detallesPago: {
          precioRenta,
          metodoPago,
        },
      },
      { new: true } // Retornar el documento actualizado
    );

    if (!rentaActualizada) {
      return res.status(404).json({ mensaje: "Renta no encontrada" });
    }

    res.status(200).json({ 
      mensaje: "Renta actualizada exitosamente", 
      renta: rentaActualizada 
    });
  } catch (error) {
    console.error("Error al editar renta:", error);
    res.status(500).json({ 
      mensaje: "Error al editar renta", 
      error: error.message 
    });
  }
};

// Función para calcular días de diferencia
function calcularDiasDiferencia(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
}
module.exports = { generarEstadisticasRentas,editarRenta,obtenerRentas,obtenerProductosRentadosByIdUser,crearRenta, listarRentasUsuario, cancelarRenta };
