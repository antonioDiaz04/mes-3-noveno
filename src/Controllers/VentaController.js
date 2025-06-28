const Venta = require("../Models/VentaModel");
const Producto = require("../Models/ProductModel");
const { logger } = require("../util/logger");
const sanitizeObject = require("../util/sanitize");
const bcrypt = require('bcrypt');
const Usuario = require('../Models/UsuarioModel');

exports.obtenerProductosCompradoByIdUser = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Obtener las ventas asociadas a un usuario
    const productosVendidos = await Venta.find({ usuario: usuarioId })
      .populate({
        path: "productos.producto",
        select: "nombre precio imagenPrincipal",
      }) // Populate en productos.producto
      .sort({ fechaVenta: -1 });

    res.status(200).json(productosVendidos);
  } catch (error) {
    console.error("Error al obtener productos vendidos:", error);
    res.status(500).json({
      mensaje: "Error al obtener los productos vendidos",
      error: error.message,
    });
  }
};


// Función para generar una contraseña segura
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

exports.crearVenta = async (req, res) => {
  try {
    const {
      usuario,
      productos,
      detallesPago,
      notas,
      esApartado,
      resumen
    } = sanitizeObject(req.body);

    const { anticipo, total } = resumen || {};
    console.log("Datos recibidos para crear venta:", req.body);

    const camposFaltantes = [];

    // Validación de campos obligatorios
    if (!usuario) camposFaltantes.push('usuario');
    if (!productos || productos.length === 0) camposFaltantes.push('productos');
    if (!detallesPago?.metodoPago) camposFaltantes.push('detallesPago.metodoPago');

    // Validar subtotal y total solo si resumen existe y tiene esos campos
    if (resumen) {
      if (resumen.subtotal === undefined) camposFaltantes.push('resumen.subtotal');
      if (resumen.total === undefined) camposFaltantes.push('resumen.total');
    } else {
      camposFaltantes.push('resumen');
    }

    // Validación para usuario nuevo (solo si usuario es objeto)
    if (typeof usuario === 'object' && usuario?.isNuevo) {
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

    let usuarioId = typeof usuario === 'object' ? usuario._id : usuario; // Si es string usarlo directamente

    // Crear usuario si es nuevo
    if (typeof usuario === 'object' && usuario.isNuevo) {
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

    // Validar productos
    const productosValidados = await Promise.all(
      productos.map(async (item) => {
        const producto = await Producto.findById(item.producto);
        if (!producto) {
          logger.warn(`Producto no encontrado: ${item.producto}`);
          throw new Error(`Producto ${item.producto} no encontrado`);
        }
        return {
          producto: producto._id,
          cantidad: item.cantidad,
          // Usa el precioUnitario enviado, si prefieres validarlo contra base, cambia aquí
          precioUnitario: item.precioUnitario || producto.precio,
          descuento: item.descuento || 0,
        };
      })
    );

    // Calcular subtotal con precios validados
    const subtotal = productosValidados.reduce(
      (total, producto) => total + producto.cantidad * producto.precioUnitario * (1 - producto.descuento / 100),
      0
    );

    // Ajustar total con impuestos y descuentos del resumen, o usar subtotal si no vienen
    const impuestos = resumen?.impuestos || 0;
    const descuentos = resumen?.descuentos || 0;
    const totalCalculado = subtotal + impuestos - descuentos;

    // Crear nueva venta con datos dinámicos
    const nuevaVenta = new Venta({
      usuario: usuarioId,
      productos: productosValidados,
      detallesPago: {
        metodoPago: detallesPago.metodoPago,
        paypalTransactionId: detallesPago.paypalTransactionId || "",
        paypalPayerEmail: detallesPago.paypalPayerEmail || "",
        ultimosDigitosTarjeta: detallesPago.ultimosDigitosTarjeta || "",
      },
      resumen: {
        subtotal: subtotal,
        total: totalCalculado,
        impuestos: impuestos,
        descuentos: descuentos,
        anticipo: anticipo || 0,
        restante: anticipo ? totalCalculado - anticipo : totalCalculado,
      },
      esApartado: esApartado || false,
      estado: "Pagado",
      fechaLimitePago: esApartado ? fechaLimitePago : null,
      notas: notas || "",
    });

    // Guardar venta
    const ventaGuardada = await nuevaVenta.save();

    res.status(201).json({
      mensaje: "Venta creada exitosamente",
      venta: ventaGuardada,
    });
  } catch (error) {
    console.error("Error crearVenta:", error);
    res.status(500).json({ mensaje: "Error al crear venta", error: error.message });
  }
};



// Listar Ventas de Usuario
exports.listarVentasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const ventas = await Venta.find({ usuario: usuarioId })
      .populate("productos.producto", "nombre imagenPrincipal")
      .sort({ createdAt: -1 });

    logger.info(`Ventas listadas para el usuario: ${usuarioId}`);
    res.status(200).json({
      total: ventas.length,
      ventas: ventas,
    });
  } catch (error) {
    logger.error(`Error al listar ventas: ${error.message}`);
    res.status(500).json({
      mensaje: "Error al listar ventas",
      error: error.message,
    });
  }
};

// Obtener Detalle de Venta
exports.obtenerDetalleVenta = async (req, res) => {
  try {
    const { ventaId } = req.params;

    const venta = await Venta.findById(ventaId)
      .populate("productos.producto")
      .populate("usuario", "nombre email");

    if (!venta) {
      logger.warn(`Venta no encontrada: ${ventaId}`);
      return res.status(404).json({
        mensaje: "Venta no encontrada",
      });
    }

    res.status(200).json(venta);
  } catch (error) {
    logger.error(`Error al obtener detalle de venta: ${error.message}`);
    res.status(500).json({
      mensaje: "Error al obtener detalle de venta",
      error: error.message,
    });
  }
};

// Función para obtener todas las ventas
exports.obtenerVentas = async (req, res) => {
  try {
    // Obtener todas las ventas sin filtro por usuario
    const ventas = await Venta.find({})
      .populate("productos", "nombre imagenPrincipal categoria precio") // Poblar la información del producto
      .sort({ fechaDeRegistro: -1 }); // Ordenar las ventas por fecha de registro

    // Retornar las ventas
    res.status(200).json({
      ventas,
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({
      mensaje: "Error al obtener ventas",
      error: error.message,
    });
  }
};


exports.elimininarById = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar la venta por ID
    const ventaEliminada = await Venta.findByIdAndDelete(id);

    if (!ventaEliminada) {
      return res.status(404).json({
        mensaje: "Venta no encontrada",
      });
    }

    res.status(200).json({
      mensaje: "Venta eliminada exitosamente",
      ventaEliminada,
    });
  }
  catch (error) {
    console.error("Error al eliminar la venta:", error);
    res.status(500).json({
      mensaje: "Error al eliminar la venta",
      error: error.message,
    });
  }
}

exports.actualizarVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { productos, detallesPago, envio, resumen } = sanitizeObject(req.body);

    // Validar productos
    const productosValidados = await Promise.all(
      productos.map(async (item) => {
        const producto = await Producto.findById(item.producto);
        if (!producto) {
          logger.warn(`Producto no encontrado: ${item.producto}`);
          throw new Error(`Producto ${item.producto} no encontrado`);
        }
        return {
          producto: producto._id,
          cantidad: item.cantidad,
          precioUnitario: producto.precio,
        };
      })
    );

    // Calcular subtotal
    const subtotal = productosValidados.reduce(
      (total, producto) => total + producto.cantidad * producto.precioUnitario,
      0
    );

    // Actualizar la venta
    const ventaActualizada = await Venta.findByIdAndUpdate(
      id,
      {
        productos: productosValidados,
        detallesPago: {
          metodoPago: detallesPago.metodoPago,
          ultimosDigitosTarjeta: detallesPago.ultimosDigitosTarjeta || "",
        },
        resumen: {
          subtotal: subtotal,
          impuestos: resumen?.impuestos || 0,
          descuentos: resumen?.descuentos || 0,
          total:
            subtotal + (resumen?.impuestos || 0) - (resumen?.descuentos || 0),
        },
        envio: {
          direccion: {
            calle: envio.direccion.calle,
            ciudad: envio.direccion.ciudad,
            estado: envio.direccion.estado,
            codigoPostal: envio.direccion.codigoPostal,
            pais: envio.direccion.pais || "México",
          },
          metodoEnvio: envio.metodoEnvio || "Estándar",
          costoEnvio: envio.costoEnvio || 0,
        },
      },
      { new: true }
    );

    if (!ventaActualizada) {
      return res.status(404).json({
        mensaje: "Venta no encontrada",
      });
    }

    res.status(200).json({
      mensaje: "Venta actualizada exitosamente",
      ventaActualizada,
    });
  } catch (error) {
    logger.error(`Error al actualizar la venta: ${error.message}`
    );
    res.status(500).json({
      mensaje: "Error al actualizar la venta",
      error: error.message,
    });
  }
}
exports.obtenerVentaByIdUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la venta por ID de usuario
    const venta = await Venta.findOne({ usuario: id })
      .populate("productos.producto", "nombre imagenPrincipal")
      .sort({ fechaDeRegistro: -1 });

    if (!venta) {
      return res.status(404).json({
        mensaje: "Venta no encontrada",
      });
    }

    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    res.status(500).json({
      mensaje: "Error al obtener la venta",
      error: error.message,
    });
  }
};
exports.obtenerVentaByIdProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la venta por ID de producto
    const venta = await Venta.findOne({ "productos.producto": id })
      .populate("productos.producto", "nombre imagenPrincipal")
      .sort({ fechaDeRegistro: -1 });

    if (!venta) {
      return res.status(404).json({
        mensaje: "Venta no encontrada",
      });
    }

    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    res.status(500).json({
      mensaje: "Error al obtener la venta",
      error: error.message,
    });
  }
};
exports.obtenerVentaByIdEstado = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la venta por ID de estado
    const venta = await Venta.findOne({ estado: id })
      .populate("productos.producto", "nombre imagenPrincipal")
      .sort({ fechaDeRegistro: -1 });

    if (!venta) {
      return res.status(404).json({
        mensaje: "Venta no encontrada",
      });
    }

    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    res.status(500).json({
      mensaje: "Error al obtener la venta",
      error: error.message,
    });
  }
};
exports.eliminarVentasSeleccionadas = async (req, res) => {
  try {
    const { ids } = req.body; // Suponiendo que los IDs vienen en el cuerpo de la solicitud

    // Eliminar las ventas seleccionadas
    const result = await Venta.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      mensaje: "Ventas eliminadas exitosamente",
      result,
    });
  } catch (error) {
    console.error("Error al eliminar las ventas:", error);
    res.status(500).json({
      mensaje: "Error al eliminar las ventas",
      error: error.message,
    });
  }
};
