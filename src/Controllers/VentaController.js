const Venta = require("../Models/VentaModel");
const Producto = require("../Models/ProductModel");
const {logger} = require("../util/logger");

exports.obtenerProductosCompradoByIdUser = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Obtener las ventas asociadas a un usuario
    const productosVendidos = await Venta.find({ usuario: usuarioId })
      .populate({ path: 'productos.producto', select: 'nombre precio imagenPrincipal' }) // Populate en productos.producto
      .sort({ fechaVenta: -1 });

    res.status(200).json(productosVendidos);
  } catch (error) {
    console.error('Error al obtener productos vendidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos vendidos', error: error.message });
  }
};

exports.crearVenta = async (req, res) => {
  try {
    // Destructurar datos del body
    const { 
      usuarioId, 
      productos, 
      detallesPago, 
      envio,
      resumen 
    } = req.body;

    // Validar productos
    const productosValidados = await Promise.all(
      productos.map(async (item) => {
        const producto = await Producto.findById(item.producto);
        if (!producto) {
          logger.warn(`Producto no encontrado: ${item.producto}`);
          throw new Error(`Producto ${item.producto} no encontrado`);
        }
        return {
          producto: producto._id, // Asegurando que sea el ID del producto
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

    // Crear nueva venta con datos dinámicos
    const nuevaVenta = new Venta({
      usuario: usuarioId,
      productos: productosValidados,
      detallesPago: {
        metodoPago: detallesPago.metodoPago,
        ultimosDigitosTarjeta: detallesPago.ultimosDigitosTarjeta || "",
      },
      resumen: {
        subtotal: subtotal,
        impuestos: resumen?.impuestos || 0,
        descuentos: resumen?.descuentos || 0,
        total: subtotal + (resumen?.impuestos || 0) - (resumen?.descuentos || 0)
      },
      envio: {
        direccion: {
          calle: envio.direccion.calle,
          ciudad: envio.direccion.ciudad,
          estado: envio.direccion.estado,
          codigoPostal: envio.direccion.codigoPostal,
          pais: envio.direccion.pais || 'México'
        },
        metodoEnvio: envio.metodoEnvio || 'Estándar',
        costoEnvio: envio.costoEnvio || 0
      }
    });

    // Guardar venta
    const ventaGuardada = await nuevaVenta.save();

    res.status(201).json({
      mensaje: "Venta creada exitosamente",
      venta: ventaGuardada,
    });
  } catch (error) {
    logger.error(`Error en creación de venta: ${error.message}`);
    res.status(500).json({
      mensaje: "Error al crear venta",
      error: error.message,
    });
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
      .populate('productos', 'nombre imagenPrincipal categoria precio') // Poblar la información del producto
      .sort({ fechaDeRegistro: -1 }); // Ordenar las ventas por fecha de registro

    // Retornar las ventas
    res.status(200).json({
      ventas,
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener ventas',
      error: error.message,
    });
  }
};

