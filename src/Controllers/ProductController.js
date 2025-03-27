// const { v2: cloudinary } = require("cloudinary");
// const { uploadImage } = require("../cloudinary/cloudinary");
const fs = require("fs-extra");

const Producto = require("../Models/ProductModel"); // Asegúrate de importar tu modelo de producto
const upload = require('../Midlewares/multer');
const cloudinary = require("cloudinary").v2;
// const Producto = require("../models/Producto"); // Importa el modelo de Producto
// const fs = require("fs/promises");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "dvvhnrvav",
  api_key: "982632489651298",
  api_secret: "TTIZcgIMiC8F4t8cE-t6XkQnPyQ",
});
exports.crearProducto = async (req, res) => {
  try {
    console.log("Contenido de req.body:", req.body);
    console.log("Archivos subidos:", req.files); // Accede a todos los archivos subidos

    const imagenesSubidas = [];

    if (req.files?.imagenes) {
      for (const imagenFile of req.files.imagenes) {
        try {
          // Subir la imagen a Cloudinary
          const resultadoOtraImagen = await cloudinary.uploader.upload(imagenFile.path, {
            folder: "ProductosAtelier",
          });
          imagenesSubidas.push(resultadoOtraImagen.url);

          // Verificar si el archivo temporal existe antes de eliminarlo
          try {
            await fs.access(imagenFile.path); // Verifica si el archivo existe
            await fs.unlink(imagenFile.path); // Eliminar el archivo temporal
            console.log(`Archivo temporal eliminado: ${imagenFile.path}`);
          } catch (error) {
            if (error.code === "ENOENT") {
              console.warn(`El archivo temporal no existe: ${imagenFile.path}`);
            } else {
              console.error(`Error al eliminar el archivo temporal: ${imagenFile.path}`, error);
            }
          }
        } catch (error) {
          console.error("Error al subir la imagen a Cloudinary:", error);
        }
      }
    }
    console.log("Imágenes subidas exitosamente");

    console.log("paso aqui 1");

    // Crea un nuevo objeto de Producto con los datos del formulario y las URLs de las imágenes
    const producto = new Producto({
      nombre: req.body.nombre,
      talla: req.body.talla,
      altura: req.body.altura,
      cintura: req.body.cintura,
      color: req.body.color,
      precio: req.body.precio,
      opcionesTipoTransaccion: req.body.opcionesTipoTransaccion || "Venta", // Valor por defecto
      nuevo: req.body.nuevo !== undefined ? req.body.nuevo : true, // Valor por defecto
      tipoCuello: req.body.tipoCuello,
      tipoCola: req.body.tipoCola,
      tipoCapas: req.body.tipoCapas,
      tipoHombro: req.body.tipoHombro,
      descripcion: req.body.descripcion,
      imagenes: imagenesSubidas, // Array de strings (URLs)
      idCategoria: req.body.idCategoria, // Relación con la categoría
    });

    console.log("Producto a guardar:", producto); // Imprimir el objeto del producto

    console.log("paso aqui 2");

    // Guardar el producto en la base de datos
    const resultadoProducto = await producto.save();
    console.log("paso aqui 3");

    // Enviar la respuesta con el producto creado
    res.status(201).json({ message: "Producto creado exitosamente", producto: resultadoProducto });

  } catch (error) {
    console.error("Error al crear el producto:", error);

    // Eliminar archivos temporales en caso de error
    if (req.files && req.files.imagenes) {
      for (const imagenFile of req.files.imagenes) {
        try {
          if (imagenFile.path) {
            await fs.unlink(imagenFile.path);
          }
        } catch (err) {
          console.error("Error al eliminar el archivo temporal:", err);
        }
      }
    }

    res.status(500).json({ error: "Ocurrió un error al crear el producto." });
  }
};
exports.editarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagenes: imagenesString, idCategoria, ...productoData } = req.body;

    console.log("Datos recibidos:", { ...productoData, imagenes: imagenesString, idCategoria });
    console.log("Archivos nuevos:", req.files);

    // 1. Buscar el producto existente
    const productoExistente = await Producto.findById(id);
    if (!productoExistente) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 2. Procesar imágenes existentes
    let imagenesFinales = [];

    // Si hay imágenes existentes en el request, las procesamos
    if (imagenesString) {
      imagenesFinales = imagenesString.split(',').map(img => img.trim());
    } else {
      // Si no vienen imágenes en el request, mantenemos las existentes
      imagenesFinales = [...productoExistente.imagenes];
    }

    // 3. Subir nuevas imágenes si existen
    if (req.files?.imagenes) {
      const archivosImagenes = Array.isArray(req.files.imagenes)
        ? req.files.imagenes
        : [req.files.imagenes];

      for (const imagenFile of archivosImagenes) {
        try {
          // Verificar si es una URL (no un archivo)
          if (typeof imagenFile === 'string' && (imagenFile.startsWith('http://') || imagenFile.startsWith('https://'))) {
            imagenesFinales.push(imagenFile); // Agregar directamente la URL
            continue; // Saltar al siguiente elemento
          }

          // Procesar como archivo solo si no es una URL
          const resultado = await cloudinary.uploader.upload(imagenFile.path, {
            folder: "ProductosAtelier",
          });
          imagenesFinales.push(resultado.secure_url);
          await fs.unlink(imagenFile.path);
        } catch (error) {
          console.error("Error al procesar imagen:", error);
        }
      }
    }

    // 4. Actualizar el producto (incluyendo idCategoria y sin eliminar imágenes existentes)
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { ...productoData, imagenes: imagenesFinales, idCategoria },
      { new: true }
    );

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      producto: productoActualizado,
      imagenesActualizadas: imagenesFinales
    });

  } catch (error) {
    console.error("Error al editar el producto:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar el producto",
      details: error.message
    });
  }
};
// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Producto.deleteOne({ _id: id });
    res.status(200).json({ message: "Producto eliminado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor: " + error);
  }
};

// Obtener todos los productos
exports.obtenerProducto = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos", error });
  }
};
// Obtener todos los productos
exports.obtenerProductoById = async (req, res) => {
  try {
    // Obtener el ID del producto desde los parámetros de la ruta
    const productoId = req.params.id;

    // Buscar el producto por su ID en la base de datos
    const producto = await Producto.findById(productoId);

    // Enviar la respuesta con el producto encontrado
    res.status(200).json(producto);
  } catch (error) {
    // En caso de error, enviar una respuesta con código 500 y el mensaje de error
    res.status(500).json({ message: "Error al obtener los detalles del producto", error });
  }
};



exports.buscarVestidos = async (req, res) => {
  try {
    const query = req.params.query;

    // Validación de query
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        mensaje: 'Término de búsqueda muy corto'
      });
    }

    // Dividir el término de búsqueda en palabras
    const palabras = query.trim().split(' ').filter(palabra => palabra.length > 0);

    // Construir la consulta con una búsqueda 'OR' para cada palabra en los campos
    const resultados = await Producto.find({
      $or: palabras.map(palabra => ({
        $or: [
          { nombre: { $regex: palabra, $options: 'i' } },
          { descripcion: { $regex: palabra, $options: 'i' } },
          { categoria: { $regex: palabra, $options: 'i' } },
          { color: { $regex: palabra, $options: 'i' } },
          { 'tallasDisponibles.talla': { $regex: palabra, $options: 'i' } }
        ]
      }))
    })
      .select('nombre imagenPrincipal precio categoria tallasDisponibles')
      .limit(50);

    // Manejo de resultados
    if (resultados.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron productos',
        resultados: []
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      total: resultados.length,
      resultados: resultados
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};
exports.buscarProductosAvanzados = async (req, res) => {
  const filtros = req.body || {};
  const query = {}; // Objeto para construir los filtros dinámicamente

  console.log('Filtros recibidos:', filtros);

  // Filtrar por categoría si se proporciona
  if (filtros.categoria) {
    query.categoria = filtros.categoria;
    console.log('Filtrando por categoría:', filtros.categoria);
  }

  // Filtrar por color si se proporciona
  if (filtros.color) {
    query.color = filtros.color;
    console.log('Filtrando por color:', filtros.color);
  }

  // Filtrar por talla disponible, si se proporciona y no es 'todas'
  if (filtros.tallaDisponible && filtros.tallaDisponible !== 'todas') {
    query.tallaDisponible = filtros.tallaDisponible; // Buscar productos con la talla específica
    console.log('Filtrando por talla disponible:', filtros.tallaDisponible);
  }

  try {
    // Consulta a la base de datos con los filtros construidos
    const productos = await Producto.find(query) // Usar el objeto query completo
      .select('nombre imagenPrincipal precio categoria tallaDisponible color')
      .limit(50);

    console.log('Productos encontrados:', productos);

    // Enviar los resultados al cliente en formato JSON
    res.status(200).json({ resultados: productos });
  } catch (error) {
    console.error('Error al buscar productos:', error);

    // Responder al cliente con un error
    res.status(500).json({ error: 'Error al buscar productos' });
  }
};

