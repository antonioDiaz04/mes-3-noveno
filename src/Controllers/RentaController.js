const Renta = require("../Models/RentaModel");
const Producto = require("../Models/ProductModel");
const { enviarNotificacion } = require("../util/webpush");
// const { logger } = require("../util/logger");
const { Usuario } = require("../Models/UsuarioModel");
const bcrypt = require('bcrypt');

function generarPasswordSegura() {
  const letras = 'abcdefghijklmnopqrstuvwxyz';
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  const especiales = '!@#$%^&*()_+[]{}|;:,.<>?';

  // Asegurar que tenga al menos uno de cada tipo
  let password = '';
  password += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
  password += letras.charAt(Math.floor(Math.random() * letras.length));
  password += numeros.charAt(Math.floor(Math.random() * numeros.length));
  password += especiales.charAt(Math.floor(Math.random() * especiales.length));

  // Rellenar hasta completar al menos 8 caracteres
  const todos = letras + mayusculas + numeros + especiales;
  while (password.length < 8) {
    password += todos.charAt(Math.floor(Math.random() * todos.length));
  }

  // Mezclar la contraseña para que no siga un patrón predecible
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}


const crearRenta = async (req, res) => {
  try {
    const {
      usuario,
      productoId,
      fechaOcupacion,
      fechaRecoge,
      fechaRegreso,
      metodoPago,
      precioRenta,
      notas
    } = req.body;

    // Validación general
    const camposFaltantes = [];
    if (!usuario) camposFaltantes.push('usuario');
    if (!productoId) camposFaltantes.push('productoId');
    if (!fechaOcupacion) camposFaltantes.push('fechaOcupacion');
    if (!fechaRecoge) camposFaltantes.push('fechaRecoge');
    if (!fechaRegreso) camposFaltantes.push('fechaRegreso');
    if (!metodoPago) camposFaltantes.push('metodoPago');
    if (precioRenta === undefined) camposFaltantes.push('precioRenta');

    // Validación para usuario nuevo
    if (usuario?.isNuevo) {
      if (!usuario.nombre) camposFaltantes.push('usuario.nombre');
      if (!usuario.email) camposFaltantes.push('usuario.email');
      if (!usuario.telefono) camposFaltantes.push('usuario.telefono');
    }

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        mensaje: 'Faltan campos obligatorios',
        camposFaltantes
      });
    }

    let usuarioId = usuario._id;

    // Crear usuario si es nuevo
    if (usuario.isNuevo) {
      const telefonoFormateado = cleanPhoneNumber(usuario.telefono);
      const yaExiste = await Usuario.findOne({ telefono: telefonoFormateado });
      if (yaExiste) {
        return res.status(400).json({ mensaje: 'El número telefónico ya está registrado' });
      }

      const passwordPlano = generarPasswordSegura();
      const hashedPassword = await bcrypt.hash(passwordPlano, 10);

      const nuevoUsuario = new Usuario({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: telefonoFormateado,
        password: hashedPassword,
        tipoCliente: 'nuevo',
        verificado: false,
        preguntaSecreta: '',
        respuestaSegura: ''
      });

      const usuarioGuardado = await nuevoUsuario.save();
      usuarioId = usuarioGuardado._id;
      console.log(`Contraseña generada para ${usuario.email}: ${passwordPlano}`);
    }

    // Verificar existencia del producto
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (new Date(fechaRegreso) <= new Date(fechaOcupacion)) {
      return res.status(400).json({ mensaje: 'La fecha de regreso debe ser posterior a la fecha de ocupación' });
    }

    // Determinar estado de entrega
    let entrega = 'Pendiente';
    const ahora = new Date();
    if (new Date(fechaRegreso) < ahora) {
      entrega = 'Vencida';
    } else if (new Date(fechaRegreso) >= ahora) {
      entrega = 'A tiempo';
    }

    // Crear la nueva renta
    const nuevaRenta = new Renta({
      usuario: usuarioId,
      producto: productoId,
      detallesRenta: {
        fechaOcupacion: new Date(fechaOcupacion),
        fechaRecoge: new Date(fechaRecoge),
        fechaRegreso: new Date(fechaRegreso),
        duracionDias: calcularDiasDiferencia(fechaOcupacion, fechaRegreso),
        entrega: entrega
      },
      detallesPago: {
        precioRenta: precioRenta,
        metodoPago: metodoPago
      },
      estado: 'Activo',
      notas: notas || ''
    });

    // Guardar y actualizar disponibilidad del producto
    const rentaGuardada = await nuevaRenta.save();
    await Producto.findByIdAndUpdate(productoId, { $set: { disponibleParaRenta: false } });

    res.status(201).json({
      mensaje: 'Renta creada exitosamente',
      renta: rentaGuardada
    });

  } catch (error) {
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
    const { rentaIds } = req.body;
    if (!rentaIds || !Array.isArray(rentaIds)) {
      return res.status(400).json({ mensaje: 'IDs inválidos' });
    }
    const rentasEliminadas = await Renta.deleteMany({ _id: { $in: rentaIds } });
    if (rentasEliminadas.deletedCount === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron rentas para eliminar' });
    }
    res.status(200).json({ mensaje: 'Rentas eliminadas exitosamente', rentasEliminadas });
  } catch (error) {
    console.error('Error al eliminar las rentas:', error);
    res.status(500).json({ mensaje: 'Error al eliminar las rentas', error: error.message });
  }
}

const obtenerRentaByIdProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const renta = await Renta.find({ _id: id })
      .populate('usuario') // Trae TODOS los campos del usuario
      .populate('producto') // Trae TODOS los campos del producto
      .sort({ fechaDeRegistro: -1 })
      .lean(); // Convertir a objetos JS planos

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


const obtenerRentas = async (req, res) => {
  try {
    // Obtener todas las rentas con todos los campos de las relaciones
    const rentas = await Renta.find({})
      .populate('usuario') // Trae TODOS los campos del usuario
      .populate('producto') // Trae TODOS los campos del producto
      .sort({ fechaDeRegistro: -1 })
      .lean(); // Convertir a objetos JS planos

    res.status(200).json({ rentas });

  } catch (error) {
    console.error('Error al obtener rentas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener rentas',
      error: error.message,
    });
  }
};

module.exports = { eliminarRentasSeleccionadas, obtenerRentaById, obtenerRentaByIdEstado, actualizarRentaById, obtenerRentaByIdProducto, elimininarById, obtenerRentas, obtenerProductosRentadosByIdUser, crearRenta, listarRentasUsuario, cancelarRenta };
